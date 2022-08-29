import React from 'react';
import Scrollbar from 'src/components/Scrollbar';
import { SidebarContext } from 'src/contexts/SidebarContext';

import { Box, Drawer, alpha, styled, Divider, useTheme, Button, Stack, Avatar, Tooltip, Typography } from '@mui/material';

import SidebarMenu from './SidebarMenu';
import Logo from 'src/components/LogoSign';
import StyledAvatar from 'src/components/StyledAvatar'
import { HiveApi } from 'src/services/HiveApi'
import { reduceDIDstring, getInfoFromDID } from 'src/utils/common'

const SidebarWrapper = styled(Box)(
  ({ theme }) => `
        width: ${theme.sidebar.width};
        min-width: ${theme.sidebar.width};
        color: ${theme.colors.alpha.trueWhite[70]};
        position: relative;
        z-index: 7;
        height: 100%;
`
);

function Sidebar() {
  const { sidebarToggle, walletAddress, toggleSidebar } = React.useContext(SidebarContext);
  const [userInfo, setUserInfo] = React.useState({})
  const closeSidebar = () => toggleSidebar();
  const theme = useTheme();
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const userDid = `did:elastos:${feedsDid}`
  const hiveApi = new HiveApi()

  React.useEffect(()=>{
    if(!feedsDid)
      return
    getInfoFromDID(userDid).then(res=>{
      setUserInfo(res)
      // hiveApi.parseDidDocumentAvatar(userDid).then(res1=>{
      //   console.log(res1, '---------')
      //   hiveApi.downloadEssAvatar(res1['avatarParam'], res1['avatarScriptName'], res1['tarDID'], res1['tarAppDID'])
      //     .then(res2=>{
      //       console.log(res2,)
      //     })
      // })
      
      // hiveApi.downloadEssAvatarFromUrl(res['avatar'].data).then(res1=>{
      //   console.log(res1)
      // })
      console.log(res)
    })
  }, [])
  return (
    <>
      <SidebarWrapper
        sx={{
          display: {
            xs: 'none',
            lg: 'table'
          },
          background: theme.sidebar.background,
          boxShadow:
            theme.palette.mode === 'dark' ? theme.sidebar.boxShadow : 'none'
        }}
      >
        <Box sx={{ display: 'table-row', height: '100%' }}>
          <Scrollbar>
            <Box mt={3} mb={4}>
              <Box mx={2}>
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
        <Box p={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <StyledAvatar alt="hames" src="/static/images/avatars/2.jpg" width={36}/>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="subtitle2" noWrap>
                {userInfo['name'] || walletAddress}
              </Typography>
              <Typography variant="body2" noWrap>
                {reduceDIDstring(userDid)}
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
