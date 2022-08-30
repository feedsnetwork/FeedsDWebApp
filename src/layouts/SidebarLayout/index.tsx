import { FC, ReactNode, useEffect, useContext, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import FadeIn from 'react-fade-in';
import { Box, alpha, lighten, useTheme, Hidden, Card, Stack, Input, Typography, Grid, styled, IconButton, Button } from '@mui/material';

import Sidebar from './Sidebar';
import SidebarChannel from './SidebarChannel';
import RightPanel from './RightPanel';
import Header from './Header';
import FloatingHeader from './FloatingHeader'
import { essentialsConnector, initConnectivitySDK } from 'src/content/signin/EssentialConnectivity';
import AddChannel from 'src/components/AddChannel';
import { HiveApi } from 'src/services/HiveApi'
import { OverPageContext } from 'src/contexts/OverPageContext';
import { SidebarContext } from 'src/contexts/SidebarContext';
import { isInAppBrowser } from 'src/utils/common'

interface SidebarLayoutProps {
  children?: ReactNode;
}

const SidebarLayout: FC<SidebarLayoutProps> = () => {
  const hiveApi = new HiveApi()
  const {setWalletAddress, focusedChannelId} = useContext(SidebarContext);
  let sessionLinkFlag = sessionStorage.getItem('FEEDS_LINK');
  if (sessionLinkFlag === '1') {
    initConnectivitySDK()
  }

  const { pageType } = useContext(OverPageContext);
  const { pathname } = useLocation();
  const theme = useTheme();

  let floatingHeaderVisible = false;
  if(
    ((pathname==='/home' || pathname==='/channel') && pageType==='AddChannel')
    || (pathname.startsWith('/channel') && focusedChannelId)
    || pathname.startsWith('/setting')
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

              <Box sx={{ overflow: 'auto', height: (theme)=>floatingHeaderVisible?`calc(100% - ${theme.header.height})`:'100%' }}>
                <Outlet />
              </Box>
          }
        </Box>
        <RightPanel />
      </Stack>
    </Box>
  );
};

export default SidebarLayout;
