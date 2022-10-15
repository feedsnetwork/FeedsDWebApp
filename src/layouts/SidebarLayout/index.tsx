import { FC, ReactNode, useEffect, useContext, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import FadeIn from 'react-fade-in';
import { Box, alpha, lighten, useTheme, Hidden, Container, Stack, Input, Typography, Grid, styled, IconButton, Button } from '@mui/material';

import Sidebar from './Sidebar';
import SidebarChannel from './SidebarChannel';
import RightPanel from './RightPanel';
import Header from './Header';
import FloatingHeader from './FloatingHeader'
import { essentialsConnector, initConnectivitySDK } from 'content/signin/EssentialConnectivity';
import AddChannel from 'components/AddChannel';
import ChannelCreatedDlg from 'components/Modal/ChannelCreated'
import PublishChannelDlg from 'components/Modal/PublishChannel'
import { OverPageContext } from 'contexts/OverPageContext';
import { SidebarContext } from 'contexts/SidebarContext';
import { CommonStatus } from 'models/common_content'
import { HiveApi } from 'services/HiveApi'
import { isInAppBrowser } from 'utils/common'
import { LocalDB, QueryStep } from 'utils/db'

interface SidebarLayoutProps {
  children?: ReactNode;
  maxWidth?: any;
}
const SidebarLayout: FC<SidebarLayoutProps> = (props) => {
  const { maxWidth=false } = props
  const {setWalletAddress, focusedChannelId, setQueryStep} = useContext(SidebarContext);
  const hiveApi = new HiveApi()
  const sessionLinkFlag = sessionStorage.getItem('FEEDS_LINK');
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const myDID = `did:elastos:${feedsDid}`
  // LocalDB.destroy()

  const querySelfChannelStep = () => (
    new Promise((resolve, reject) => {
      hiveApi.querySelfChannels()
        .then(res=>{
          // console.log(res, '-----------self')
          if(Array.isArray(res)){
            const selfChannels = 
              res.filter(item=>item.status!=CommonStatus.deleted)
                .map(item=>{
                  item.target_did = myDID
                  return item
                })
            const selfChannelDoc = selfChannels.map(async channel=>{
              const parseAvatar = channel['avatar'].split('@')
              const avatarRes = await hiveApi.downloadCustomeAvatar(parseAvatar[parseAvatar.length-1])
              const dataObj = {...channel, _id: channel.channel_id.toString(), is_self: true, is_subscribed: false, is_public: false, table_type: 'channel'}
              if(avatarRes && avatarRes.length) {
                dataObj['avatarSrc'] = avatarRes
              }
              return dataObj
            })
            Promise.all(selfChannelDoc)
              .then(selfChannelData => LocalDB.bulkDocs(selfChannelData))
              .then(_=>LocalDB.put({_id: 'query-step', step: QueryStep.self_channel}))
              .then(_=>{ 
                setQueryStep(QueryStep.self_channel) 
                resolve({success: true})
              })
              .catch(err=>{
                resolve({success: false, error: err})
              })
          }
          else
            resolve({success: true})
        })
        .catch(err=>{
          reject(err)
        })
    })
  )

  const querySubscribedChannelStep = () => (
    new Promise((resolve, reject) => {
      hiveApi.queryBackupData()
        .then(backupRes=>{
          if(Array.isArray(backupRes)) {
            const backupChannelDocs = backupRes.map(async channel=>{
              const channelInfoRes = await hiveApi.queryChannelInfo(channel.target_did, channel.channel_id)
              if(channelInfoRes['find_message'] && channelInfoRes['find_message']['items'].length) {
                const channelInfo = channelInfoRes['find_message']['items'][0]
                const dataObj = {...channelInfo, _id: channel.channel_id.toString(), target_did: channel.target_did, is_self: false, is_subscribed: true, is_public: false, table_type: 'channel'}
                try {
                  const avatarRes = await hiveApi.downloadScripting(channel.target_did, channelInfo.avatar)
                  dataObj['avatarSrc'] = avatarRes
                } catch(err) {
                  console.log(err)
                }
                return dataObj
              }
            })
            Promise.all(backupChannelDocs)
              .then(subscribedChannels=>{
                const selfSubcribedChannels = subscribedChannels.filter(channel=>channel.target_did === myDID)
                const othersSubcribedChannels = subscribedChannels.filter(channel=>channel.target_did !== myDID)
                return Promise.resolve({self: selfSubcribedChannels, others: othersSubcribedChannels})
              })
              .then(subscribedChannelData => {
                const insertOtherChannelAction = LocalDB.bulkDocs(subscribedChannelData.others)
                const updateSelfChannelAction = subscribedChannelData.self.map(channelDoc=>(
                  new Promise((resolveSub, rejectSub)=>{
                    LocalDB.get(channelDoc.channel_id.toString())
                      .then(doc => resolveSub(LocalDB.put({ ...doc, is_subscribed: true })))
                      .catch(err => resolveSub(LocalDB.put(channelDoc)))
                  })
                ))
                return Promise.all([insertOtherChannelAction, ...updateSelfChannelAction])
              })
              .then(async _=>{
                const stepDoc = await LocalDB.get('query-step')
                return LocalDB.put({_id: 'query-step', step: QueryStep.subscribed_channel, _rev: stepDoc._rev})
              })
              .then(_=>{ 
                setQueryStep(QueryStep.subscribed_channel) 
                resolve({success: true})
              })
              .catch(err=>{
                resolve({success: false, error: err})
              })
          }
          else
            resolve({success: true})
        })
        .catch(err=>{
          reject(err)
        })
    })
  )
    
  const querySteps = [querySelfChannelStep, querySubscribedChannelStep]
  useEffect(()=>{
    LocalDB.createIndex({
      index: {
        fields: ['table_type', 'is_self', 'is_subscribed', 'is_public'],
      }
    })
    LocalDB.get('query-step')
      .then(currentStep=>{
        setQueryStep(currentStep['step'])
        const remainedSteps = querySteps.slice(currentStep['step']).map(func=>func())
        Promise.all(remainedSteps)
          .then(res=>{
            console.log(res, "---oo")
          })
      })
      .catch(err=>{
        Promise.all(querySteps.map(func=>func()))
          .then(res=>{
            console.log(res)
          })
      })
  }, [])


  const initializeWalletConnection = () => {
    if (sessionLinkFlag === '1') {
      setWalletAddress(
        isInAppBrowser()
          ? window['elastos'].getWeb3Provider().address
          : essentialsConnector.getWalletConnectProvider().wc.accounts[0]
      );
    }
  };
  if (sessionLinkFlag === '1') {
    initConnectivitySDK(initializeWalletConnection)
  }

  const { pageType } = useContext(OverPageContext);
  const { pathname } = useLocation();
  const theme = useTheme();

  let floatingHeaderVisible = false;
  if(
    ((pathname==='/home' || pathname==='/channel') && pageType==='AddChannel')
    || (pathname.startsWith('/channel') && focusedChannelId)
    || pathname.startsWith('/subscription/channel')
    || pathname.startsWith('/explore/channel')
    || pathname.startsWith('/setting')
    || pathname.startsWith('/post/')
    || pathname==='/profile'
  )
    floatingHeaderVisible = true;

  const addChannelVisible = (pathname==='/home' || pathname==='/channel') && pageType==='AddChannel'
  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',

        '.MuiPageTitle-wrapper': {
          background:
            theme.palette.mode === 'dark'
              ? theme.colors.alpha.trueWhite[5]
              : theme.colors.alpha.white[50],
          marginBottom: `${theme.spacing(4)}`,
          boxShadow:
            theme.palette.mode === 'dark'
              ? `0 1px 0 ${alpha(
                  lighten(theme.colors.primary.main, 0.7),
                  0.15
                )}, 0px 2px 4px -3px rgba(0, 0, 0, 0.2), 0px 5px 12px -4px rgba(0, 0, 0, .1)`
              : `0px 2px 4px -3px ${alpha(
                  theme.colors.alpha.black[100],
                  0.1
                )}, 0px 5px 12px -4px ${alpha(
                  theme.colors.alpha.black[100],
                  0.05
                )}`
        }
      }}
    >
      <Hidden lgUp>
        <Header />
      </Hidden>
      <Stack direction='row' sx={{height: '100%'}}>
        <SidebarChannel />
        <Sidebar />
        <Box
          sx={{
            position: 'relative',
            zIndex: 5,
            display: 'block',
            flex: 1,
            pt: `${theme.header.height}`,
            minHeight: '100%',
            background: theme.colors.default.main,
            overflow: 'hidden',
            [theme.breakpoints.up('lg')]: {
              pt: 0,
            }
          }}
        >
          {
            floatingHeaderVisible &&
            <FloatingHeader/>
          }
          {
              addChannelVisible?
              <Box sx={{ overflow: 'auto', height: (theme)=>`calc(100% - ${theme.header.height})` }}>
                <FadeIn>
                  <AddChannel/>
                </FadeIn>
              </Box>:

              <Box id="scrollableBox" sx={{ overflow: 'auto', height: (theme)=>floatingHeaderVisible?`calc(100% - ${theme.header.height})`:'100%' }}>
                <Container sx={{ flexGrow: 1, overFlow: 'auto', p: '0px !important', height: '100%' }} maxWidth={maxWidth}>
                  <Outlet />
                </Container>
              </Box>
          }
        </Box>
        {
          !(pathname === '/explore' || pathname === '/explore/') &&
          <RightPanel />
        }
      </Stack>
      <ChannelCreatedDlg/>
      <PublishChannelDlg/>
    </Box>
  );
};

export default SidebarLayout;
