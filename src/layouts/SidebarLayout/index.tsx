import { FC, ReactNode, useEffect, useContext } from 'react';
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
import UnsubscribeChannelDlg from 'components/Modal/Unsubscribe'
import PostDlg from 'components/Modal/Post'
import CommentDlg from 'components/Modal/Comment'
import DeletePostDlg from 'components/Modal/DeletePost'
import { OverPageContext } from 'contexts/OverPageContext';
import { SidebarContext } from 'contexts/SidebarContext';
import { selectFocusedChannelId } from 'redux/slices/channel'
import { isInAppBrowser, promiseSeries } from 'utils/common'
import { getLocalDB, StepType } from 'utils/db'
import { mainproc } from 'utils/mainproc';
import { updateProc, updatePublicProc } from 'redux/slices/proc';

interface SidebarLayoutProps {
  children?: ReactNode;
  maxWidth?: any;
}
const SidebarLayout: FC<SidebarLayoutProps> = (props) => {
  const { maxWidth=false } = props
  const { setWalletAddress, setQueryStep, setQueryPublicStep, setQueryFlag, setQueryPublicFlag } = useContext(SidebarContext);
  const sessionLinkFlag = sessionStorage.getItem('FEEDS_LINK');
  const dispatch = useDispatch()
  const focusedChannelId = useSelector(selectFocusedChannelId)
  const LocalDB = getLocalDB()
  // LocalDB.destroy()

  const propsInProc = { dispatch, setQueryStep, setQueryPublicStep, setQueryFlag, setQueryPublicFlag }
  const procSteps = mainproc(propsInProc)
  const querySteps = procSteps.querySteps
  const queryPublicSteps = procSteps.queryPublicSteps
  
  useEffect(()=>{
    LocalDB.get('query-step')
      .then(currentStep=>{
        setQueryStep(currentStep['step'])
        const passedSteps = Object.values(StepType)
          .filter(step=>(step.index <= currentStep['step'] && step.name !== 'public_channel'))
          .reduce((stepObj, step)=>{
            stepObj[step.name] = 1
            return stepObj
          }, {})
        dispatch(updateProc(passedSteps))
        // const remainedSteps = querySteps.slice(currentStep['step']).map(func=>func())
        // Promise.all(remainedSteps)
        //   .then(res=>{
        //     console.log(res, "---result")
        //   })
        promiseSeries(querySteps)
          .then(res=>{
            console.log(res, "---result")
          })
      })
      .catch(err=>{
        promiseSeries(querySteps)
      })

    LocalDB.get('query-public-step')
      .then(currentPublicStep=>{
        setQueryPublicStep(currentPublicStep['step'])
        const passedSteps = Object.values(StepType)
          .filter(step=>(1<step.index && step.index<=currentPublicStep['step'] && step.name !== 'subscribed_channel'))
          .reduce((stepObj, step)=>{
            stepObj[step.name] = 1
            return stepObj
          }, {})
        dispatch(updatePublicProc(passedSteps))
        // const remainedSteps = queryPublicSteps.slice(currentPublicStep['step']).map(func=>func())
        // Promise.all(remainedSteps)
        //   .then(res=>{
        //     console.log(res, "---result")
        //   })
        promiseSeries(queryPublicSteps)
          .then(res=>{
            console.log(res, "---result")
          })
      })
      .catch(err=>{
        promiseSeries(queryPublicSteps)
          .then(res=>console.info(res, '--------end'))
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <UnsubscribeChannelDlg/>
      <PostDlg/>
      <DeletePostDlg/>
      <CommentDlg/>
    </Box>
  );
};

export default SidebarLayout;
