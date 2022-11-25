import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, styled, Divider, useTheme, Stack, Typography, Badge } from '@mui/material';

import SidebarMenu from './SidebarMenu';
import StyledAvatar from 'components/StyledAvatar'
import Scrollbar from 'components/Scrollbar';
import { HiveApi } from 'services/HiveApi'
import { SidebarContext } from 'contexts/SidebarContext';
import { selectMyInfo, setMyInfo, setUserInfo } from 'redux/slices/user';
import { getLocalDB } from 'utils/db';
import { reduceDIDstring, getInfoFromDID, reduceHexAddress, encodeBase64, decodeBase64 } from 'utils/common'

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
  const { walletAddress } = React.useContext(SidebarContext);
  // const closeSidebar = () => toggleSidebar();
  const dispatch = useDispatch()
  const myInfo = useSelector(selectMyInfo)
  const theme = useTheme();
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const myDID = `did:elastos:${feedsDid}`
  const hiveApi = new HiveApi()
  const LocalDB = getLocalDB()
  
  React.useEffect(()=>{
    if(!feedsDid)
      return
    LocalDB.get(myDID)
      .then(doc=>{
        dispatch(setMyInfo(doc))
      })
      .catch(err=>{})
    hiveApi.getHiveUrl(myDID)
      .then(hiveUrl=>hiveApi.downloadFileByHiveUrl(myDID, hiveUrl))
      .then(res=>{
        const resBuf = res as Buffer
        if(resBuf && resBuf.length) {
          const base64Content = resBuf.toString('base64')
          const avatarObj = { avatarSrc: encodeBase64(`data:image/png;base64,${base64Content}`) }
          storeMyInfo(avatarObj)
          const avatarUserObj = {}
          avatarUserObj[myDID] = {avatarSrc: avatarObj.avatarSrc}
          dispatch(setUserInfo(avatarUserObj))
        }
      })
      .catch(err=>{})

    getInfoFromDID(myDID).then(res=>{
      storeMyInfo(res as object)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const storeMyInfo = (userInfo: object)=>{
    dispatch(setMyInfo(userInfo))
    LocalDB.get(myDID)
      .then(doc=>{
        const updateDoc = {...doc, ...userInfo}
        LocalDB.put(updateDoc)
      })
      .catch(_=>{
        const newDoc = {...userInfo, _id: myDID, table_type: 'user'}
        LocalDB.put(newDoc)
      })
  }
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
                <Badge color="secondary" badgeContent="BETA">
                  <Typography
                    variant="h4"
                    sx={{ pt: 1, }}
                  >
                    Feeds Network
                  </Typography>
                </Badge>
              </Box>
            </Box>
            <SidebarMenu/>
          </Scrollbar>
        </Box>
        <Divider
          sx={{
            background: theme.colors.alpha.trueWhite[10]
          }}
        />
        <Box p={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <StyledAvatar alt="" src={decodeBase64(myInfo['avatarSrc'])} width={36}/>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="subtitle2" noWrap>
                {myInfo['name'] || reduceHexAddress(walletAddress)}
              </Typography>
              <Typography variant="body2" noWrap>
                {reduceDIDstring(myDID)}
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
