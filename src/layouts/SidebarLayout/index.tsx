import { FC, ReactNode, useEffect, useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import FadeIn from 'react-fade-in';
import { Box, alpha, lighten, useTheme, Hidden, Container, Stack } from '@mui/material';

import Sidebar from './Sidebar';
import SidebarChannel from './SidebarChannel';
import RightPanel from './RightPanel';
import Header from './Header';
import FloatingHeader from './FloatingHeader'
import { essentialsConnector, initConnectivitySDK } from 'content/signin/EssentialConnectivity';
import AddChannel from 'components/AddChannel';
import ChannelCreatedDlg from 'components/Modal/ChannelCreated'
import PublishChannelDlg from 'components/Modal/PublishChannel'
import UnpublishChannelDlg from 'components/Modal/UnpublishChannel'
import CommentDlg from 'components/Modal/Comment'
import PostDlg from 'components/Modal/Post'
import DeletePostDlg from 'components/Modal/DeletePost'
import { OverPageContext } from 'contexts/OverPageContext';
import { SidebarContext } from 'contexts/SidebarContext';
import { HiveApi } from 'services/HiveApi'
import { selectSubscribers, selectFocusedChannelId } from 'redux/slices/channel'
import { setUserAvatarSrc, setUserInfo } from 'redux/slices/user'
import { encodeBase64, isInAppBrowser, promiseSeries, getInfoFromDID, getFilteredArrayByUnique, getMergedArray, filterAlreadyQueried } from 'utils/common'
import { getLocalDB, QueryStep } from 'utils/db'
import { mainproc } from 'utils/mainproc';

interface SidebarLayoutProps {
  children?: ReactNode;
  maxWidth?: any;
}
const SidebarLayout: FC<SidebarLayoutProps> = (props) => {
  const { maxWidth=false } = props
  const { setWalletAddress, setQueryStep, setQueryPublicStep, setQueryFlag, setQueryPublicFlag } = useContext(SidebarContext);
  const [queriedDIDs, setQueriedDIDs] = useState(null)
  const [queryingDIDs, setQueryingDIDs] = useState([])
  const hiveApi = new HiveApi()
  const sessionLinkFlag = sessionStorage.getItem('FEEDS_LINK');
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const myDID = `did:elastos:${feedsDid}`
  const dispatch = useDispatch()
  const subscribersOfChannel = useSelector(selectSubscribers)
  const focusedChannelId = useSelector(selectFocusedChannelId)
  const LocalDB = getLocalDB()
  // LocalDB.destroy()

  const propsInProc = { dispatch, setQueryStep, setQueryPublicStep, setQueryFlag, setQueryPublicFlag }
  const procSteps = mainproc(propsInProc)
  const querySteps = procSteps.querySteps
  const queryPublicSteps = procSteps.queryPublicSteps
  const { queryDispNameStep, queryChannelAvatarStep, querySubscriptionInfoStep } = procSteps.asyncSteps
  
  useEffect(()=>{
    LocalDB.createIndex({
      index: {
        fields: ['table_type'],
      }
    }).then(()=>{
      LocalDB.get('query-step')
        .then(currentStep=>{
          setQueryStep(currentStep['step'])
          // const remainedSteps = querySteps.slice(currentStep['step']).map(func=>func())
          // Promise.all(remainedSteps)
          //   .then(res=>{
          //     console.log(res, "---result")
          //   })
          promiseSeries(querySteps)
            .then(res=>{
              console.log(res, "---result")
            })
          if(currentStep['step'] >= QueryStep.subscribed_channel) {
            queryChannelAvatarStep()
            queryDispNameStep()
            querySubscriptionInfoStep()
          }
          LocalDB.find({
            selector: {
              table_type: 'user'
            }
          })
            .then(res=>{
              const avatarSrcObj = res.docs.filter(doc=>!!doc['avatarSrc'])
                .reduce((avatarObj, doc)=>{
                  avatarObj[doc._id] = doc['avatarSrc']
                  return avatarObj
                }, {})
              const usersObj = res.docs.reduce((userObj, doc)=>{
                userObj[doc._id] = doc
                return userObj
              }, {})
              setQueriedDIDs([myDID, ...Object.keys(usersObj)])
              dispatch(setUserInfo(usersObj))
              dispatch(setUserAvatarSrc(avatarSrcObj))
            })
        })
        .catch(err=>{
          setQueriedDIDs([myDID])
          promiseSeries(querySteps)
        })

      LocalDB.get('query-public-step')
        .then(currentPublicStep=>{
          setQueryPublicStep(currentPublicStep['step'])
          // const remainedSteps = queryPublicSteps.slice(currentPublicStep['step']).map(func=>func())
          // Promise.all(remainedSteps)
          //   .then(res=>{
          //     console.log(res, "---result")
          //   })
          promiseSeries(queryPublicSteps)
            .then(res=>{
              console.log(res, "---result")
            })
          if(currentPublicStep['step'] >= QueryStep.public_channel) {
            queryDispNameStep(true)
            querySubscriptionInfoStep(true)
          }
        })
        .catch(err=>{
          promiseSeries(queryPublicSteps)
            .then(res=>console.info(res, '--------end'))
        })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(()=>{
    if(queriedDIDs) {
      let subscribers = getMergedArray(subscribersOfChannel)
      subscribers = getFilteredArrayByUnique(subscribers, 'user_did')
      subscribers = filterAlreadyQueried(subscribers, [...queriedDIDs, ...queryingDIDs], 'user_did')
      setQueryingDIDs(prev=>{
        const tempState = [...prev, ...subscribers.map(subscriber=>subscriber.user_did)]
        return tempState
      })
      subscribers.forEach(subscriber=>{
        const userObj = {}
        getInfoFromDID(subscriber.user_did)
          .then(userInfo=>{
            const infoDoc = {...userInfo as object, _id: subscriber.user_did, table_type: 'user'}
            userObj[subscriber.user_did] = infoDoc
            return LocalDB.put(infoDoc)
          })
          .then(response=>{
            dispatch(setUserInfo(userObj))
            const avatarObj = {}
            Promise.resolve()
              .then(_=>hiveApi.getHiveUrl(subscriber.user_did))
              .then(hiveUrl=>hiveApi.downloadFileByHiveUrl(subscriber.user_did, hiveUrl))
              .then(res=>{
                const resBuf = res as Buffer
                if(resBuf && resBuf.length) {
                  const base64Content = resBuf.toString('base64')
                  avatarObj[subscriber.user_did] = encodeBase64(`data:image/png;base64,${base64Content}`)
                  return LocalDB.get(subscriber.user_did)
                }
              })
              .then(doc=>{
                const infoDoc = {...doc, avatarSrc: avatarObj[subscriber.user_did]}
                LocalDB.put(infoDoc)
                dispatch(setUserAvatarSrc(avatarObj))
              })
              .catch(err=>{})
          })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribersOfChannel, queriedDIDs])

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
  let rightPanelVisible = true
  switch(pathname.replaceAll('/','')) {
    case "explore":
      rightPanelVisible = false
      break;
    default:
      rightPanelVisible = true
      break;
  }
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
      <svg width={0} height={0} style={{display: 'block'}}>
        <linearGradient id="linearColors" x1={0} y1={1} x2={1} y2={1}>
          <stop offset={0} stopColor="#7624FE" />
          <stop offset={1} stopColor="#368BFF" />
        </linearGradient>
      </svg>
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
            <FloatingHeader rightPanelVisible={rightPanelVisible}/>
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
          rightPanelVisible && <RightPanel />
        }
      </Stack>
      <ChannelCreatedDlg/>
      <PublishChannelDlg/>
      <UnpublishChannelDlg/>
      <PostDlg/>
      <DeletePostDlg/>
      <CommentDlg/>
    </Box>
  );
};

export default SidebarLayout;
