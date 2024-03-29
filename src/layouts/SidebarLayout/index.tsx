import { FC, ReactNode, useEffect, useContext, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import FadeIn from 'react-fade-in';
import { Box, alpha, lighten, useTheme, Hidden, Container, Stack } from '@mui/material';

import Sidebar from './Sidebar';
import SidebarChannel from './SidebarChannel';
import RightPanel from './RightPanel';
import Header from './Header';
import FloatingHeader from './FloatingHeader'
import BannerNotice from './BannerNotice';
import AddChannel from 'components/AddChannel';
import ChannelCreatedDlg from 'components/Modal/ChannelCreated'
import PublishChannelDlg from 'components/Modal/PublishChannel'
import UnpublishChannelDlg from 'components/Modal/UnpublishChannel'
import UnsubscribeChannelDlg from 'components/Modal/Unsubscribe'
import PostDlg from 'components/Modal/Post'
import CommentDlg from 'components/Modal/Comment'
import PostImgScreenDlg from 'components/Modal/PostImgScreen'
import DeletePostDlg from 'components/Modal/DeletePost'
import { essentialsConnector, initConnectivitySDK } from 'content/signin/EssentialConnectivity';
import { OverPageContext } from 'contexts/OverPageContext';
import { SidebarContext } from 'contexts/SidebarContext';
import { selectFocusedChannelId } from 'redux/slices/channel'
import { updateProc, updatePublicProc } from 'redux/slices/proc';
import { setPostMediaLoaded, updateLoadedPostCount } from 'redux/slices/post';
import { setUserInfo } from 'redux/slices/user';
import { isInAppBrowser } from 'utils/common'
import { getLocalDB, StepType } from 'utils/db'
import { mainproc } from 'utils/mainproc';

interface SidebarLayoutProps {
  children?: ReactNode;
  maxWidth?: any;
}
const SidebarLayout: FC<SidebarLayoutProps> = (props) => {
  const { maxWidth=false } = props
  const { needQueryChannel, setWalletAddress } = useContext(SidebarContext);
  const focusedChannelId = useSelector(selectFocusedChannelId)
  const sessionLinkFlag = localStorage.getItem('FEEDS_LINK');
  const dispatch = useDispatch()
  const LocalDB = getLocalDB()
  // LocalDB.destroy()

  const propsInProc = { dispatch }
  const proc = mainproc(propsInProc)
  
  useEffect(()=>{
    mainQueryAction()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mainQueryAction = useCallback(() => {
    LocalDB.find({
      selector: {
        table_type: 'channel',
        is_subscribed: true
      }
    })
      .then(response=>response.docs.map(doc=>doc._id))
      .then(channelIDs=>{
        LocalDB.find({
          selector: {
            table_type: 'post',
            channel_id: { $in: channelIDs },
          },
        })
          .then(response => dispatch(updateLoadedPostCount(response.docs.length)))
      })
    LocalDB.find({
      selector: {
        table_type: 'post',
        media_path: {'$exists': true}
      }
    })
      .then(response=>dispatch(setPostMediaLoaded(response.docs)))
    LocalDB.find({ selector: {table_type: 'user'} })
      .then(response=>dispatch(setUserInfo(response.docs)))
    const queryProc = proc.queryProc
    proc.queryLocalChannelStep()
      .then(_=>{
        syncPassedStep()
        syncPassedStep(true)
      })
    Object.keys(queryProc).forEach(type=>{
      if(needQueryChannel)
        queryProc[type]().then(_=>proc.streamByChannelType(type))
      else
        proc.streamByChannelType(type)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needQueryChannel])

  const syncPassedStep = (isPublic=false) => {
    let stepId = `query${isPublic? '-public': ''}-step`
    const stepFilterMethod = (item, currentStep, isPublic) => {
      if(isPublic)
        return 1<item.index && item.index<=currentStep['step'] && item.name !== 'subscribed_channel'
      return item.index <= currentStep['step'] && item.name !== 'public_channel'
    }
    const updateStateAction = isPublic? updatePublicProc: updateProc
    LocalDB.get(stepId)
      .then(currentStep=>{
        const passedSteps = Object.values(StepType)
          .filter(step=>stepFilterMethod(step, currentStep, isPublic))
          .reduce((stepObj, step)=>{
            stepObj[step.name] = 1
            return stepObj
          }, {})
        dispatch(updateStateAction(passedSteps))
      })
      .catch(err=>{})
  }
  const initializeWalletConnection = () => {
    if (sessionLinkFlag === '1') {
      setWalletAddress(
        isInAppBrowser()
          ? window['elastos'].getWeb3Provider().address
          : essentialsConnector.getWalletConnectProvider().wc.accounts[0]
      );
    }
  }
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
    || pathname.startsWith('/subscription/list')
    || pathname.startsWith('/subscriber/list')
    || pathname.startsWith('/explore/channel')
    || pathname.startsWith('/setting')
    || pathname.startsWith('/post/')
    || pathname.startsWith('/profile')
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
      <BannerNotice />
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
      <ChannelCreatedDlg />
      <PublishChannelDlg />
      <UnpublishChannelDlg />
      <UnsubscribeChannelDlg />
      <PostDlg />
      <DeletePostDlg />
      <CommentDlg />
      <PostImgScreenDlg />
    </Box>
  );
};

export default SidebarLayout;
