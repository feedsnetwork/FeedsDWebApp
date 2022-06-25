import { FC, ReactNode, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import FadeIn from 'react-fade-in';
import { Box, alpha, lighten, useTheme, Hidden, Card, Stack, Input, Typography, Grid, styled, IconButton, Button } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';

import Sidebar from './Sidebar';
import SidebarChannel from './SidebarChannel';
import RightPanel from './RightPanel';
import Header from './Header';
import { OverPageProvider, OverPageContext } from 'src/contexts/OverPageContext';
import AddChannel from 'src/components/AddChannel';

const HeaderWrapper = styled(Box)(
  ({ theme }) => `
        height: ${theme.header.height};
        color: ${theme.header.textColor};
        padding: ${theme.spacing(0, 2)};
        right: ${theme.rightPanel.width};
        z-index: 6;
        background-color: ${alpha(theme.header.background, 0.95)};
        backdrop-filter: blur(3px);
        position: fixed;
        justify-content: space-between;
        width: 100%;
        @media (min-width: ${theme.breakpoints.values.lg}px) {
            // margin-left: calc(${theme.sidebarChannel.width} + ${theme.sidebar.width});
            // margin-right: ${theme.rightPanel.width};
            left: calc(${theme.sidebarChannel.width} + ${theme.sidebar.width});
            width: auto;
        }
`
);

interface SidebarLayoutProps {
  children?: ReactNode;
}

const SidebarLayout: FC<SidebarLayoutProps> = () => {
  const { isAddChannelView, closeAddChannelView } = useContext(OverPageContext);
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
            overflow: 'auto',
            [theme.breakpoints.up('lg')]: {
              pt: 0,
            }
          }}
        >
          <Box display="block">
            {
              isAddChannelView?
              <>
                <Hidden lgDown>
                  <Box sx={{pb: (theme)=>`${theme.header.height}`}}>
                    <HeaderWrapper
                      display="flex"
                      alignItems="center"
                      sx={{
                        boxShadow:
                          theme.palette.mode === 'dark'
                            ? `0 1px 0 ${alpha(
                                lighten(theme.colors.primary.main, 0.7),
                                0.15
                              )}, 0px 2px 8px -3px rgba(0, 0, 0, 0.2), 0px 5px 22px -4px rgba(0, 0, 0, .1)`
                            : `0px 2px 8px -3px ${alpha(
                                theme.colors.alpha.black[100],
                                0.2
                              )}, 0px 5px 22px -4px ${alpha(
                                theme.colors.alpha.black[100],
                                0.1
                              )}`
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                      >
                        <Button
                          color="inherit"
                          startIcon={<ArrowBack />}
                          onClick={()=>{closeAddChannelView()}}
                        >
                          Add Channel
                        </Button>
                      </Stack>
                    </HeaderWrapper>
                  </Box>
                </Hidden>
                <FadeIn>
                  <AddChannel/>
                </FadeIn>
              </>:

              <Outlet />
            }
          </Box>
        </Box>
        <RightPanel />
      </Stack>
    </Box>
  );
};

export default SidebarLayout;
