import { FC, ReactNode, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import FadeIn from 'react-fade-in';
import { Box, alpha, lighten, useTheme, Hidden, Card, Stack, Input, Typography, Grid, styled, IconButton } from '@mui/material';

import Sidebar from './Sidebar';
import SidebarChannel from './SidebarChannel';
import RightPanel from './RightPanel';
import Header from './Header';
import { OverPageProvider, OverPageContext } from 'src/contexts/OverPageContext';
import AddChannel from 'src/components/AddChannel';

interface SidebarLayoutProps {
  children?: ReactNode;
}

const SidebarLayout: FC<SidebarLayoutProps> = () => {
  const { isAddChannelView } = useContext(OverPageContext);
  const theme = useTheme();

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
            ml: `calc(${theme.sidebarChannel.width} + ${theme.sidebar.width})`,
            mr: `${theme.rightPanel.width}`
          }
        }}
      >
        <Box display="block">
          {
            isAddChannelView?
            <FadeIn>
              <AddChannel/>
            </FadeIn>:

            <Outlet />
          }
        </Box>
      </Box>
      <RightPanel />
    </Box>
  );
};

export default SidebarLayout;
