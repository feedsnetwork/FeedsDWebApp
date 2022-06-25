import { useContext } from 'react';
import Scrollbar from 'src/components/Scrollbar';
import { SidebarContext } from 'src/contexts/SidebarContext';

import { Box, Drawer, alpha, styled, Divider, useTheme, Button, Stack, Avatar, Tooltip, Typography } from '@mui/material';

import SidebarMenu from './SidebarMenu';
import Logo from 'src/components/LogoSign';
import StyledAvatar from 'src/components/StyledAvatar'
import { reduceDIDstring } from 'src/utils/common'

const SidebarWrapper = styled(Box)(
  ({ theme }) => `
        width: ${theme.sidebar.width};
        min-width: ${theme.sidebar.width};
        color: ${theme.colors.alpha.trueWhite[70]};
        position: relative;
        z-index: 7;
        height: 100%;
        // padding-bottom: 68px;
`
);

function Sidebar() {
  const { sidebarToggle, toggleSidebar } = useContext(SidebarContext);
  const closeSidebar = () => toggleSidebar();
  const theme = useTheme();

  return (
    <>
      <SidebarWrapper
        sx={{
          display: {
            xs: 'none',
            lg: 'table'
          },
          position: 'fixed',
          left: theme.sidebarChannel.width,
          top: 0,
          background: theme.sidebar.background,
          boxShadow:
            theme.palette.mode === 'dark' ? theme.sidebar.boxShadow : 'none'
        }}
      >
        <Box sx={{ display: 'table-row', height: '100%' }}>
          <Scrollbar>
            <Box mt={3} mb={4}>
              <Box
                mx={2}
              >
                <Typography
                  variant="h4"
                  sx={{ pt: 1, }}
                >
                  Feeds Network
                </Typography>
              </Box>
            </Box>
            <SidebarMenu />
          </Scrollbar>
        </Box>
        <Divider
          sx={{
            background: theme.colors.alpha.trueWhite[10]
          }}
        />
        <Box p={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <StyledAvatar alt="hames" src="/static/images/avatars/2.jpg"/>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="subtitle2" noWrap>
                hames
              </Typography>
              <Typography variant="body2" noWrap>
                {reduceDIDstring('did:elastos:inSeTvmVDj6to7dHSZgkRZuUJYc9yHJChN')}
              </Typography>
            </Box>
          </Stack>
          {/* <Button
            href="https://bloomui.com"
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            color="success"
            size="small"
            fullWidth
          >
            Upgrade to PRO
          </Button> */}
        </Box>
      </SidebarWrapper>
      {/* <Drawer
        sx={{
          boxShadow: `${theme.sidebar.boxShadow}`
        }}
        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
        open={sidebarToggle}
        onClose={closeSidebar}
        variant="temporary"
        elevation={9}
      >
        <SidebarWrapper
          sx={{
            background:
              theme.palette.mode === 'dark'
                ? theme.colors.alpha.white[100]
                : darken(theme.colors.alpha.black[100], 0.5)
          }}
        >
          <Scrollbar>
            <Box mt={3}>
              <Box
                mx={2}
                sx={{
                  width: 52
                }}
              >
                <Logo />
              </Box>
            </Box>
            <Divider
              sx={{
                mt: theme.spacing(3),
                mx: theme.spacing(2),
                background: theme.colors.alpha.trueWhite[10]
              }}
            />
            <SidebarMenu />
          </Scrollbar>
        </SidebarWrapper>
      </Drawer> */}
    </>
  );
}

export default Sidebar;
