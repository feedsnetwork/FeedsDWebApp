import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Stack, Box, Button, Hidden, ListItemText, Typography, styled, alpha, lighten } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';

import { SidebarContext } from 'src/contexts/SidebarContext';
import { OverPageContext } from 'src/contexts/OverPageContext';
import { HiveApi } from 'src/services/HiveApi'
import { SettingMenuArray, getAppPreference } from 'src/utils/common'

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
        display: flex;
        align-items: center;
        @media (min-width: ${theme.breakpoints.values.lg}px) {
            // margin-left: calc(${theme.sidebarChannel.width} + ${theme.sidebar.width});
            // margin-right: ${theme.rightPanel.width};
            left: calc(${theme.sidebarChannel.width} + ${theme.sidebar.width});
            width: auto;
        }
        box-shadow: ${
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
        };
`
);
function FloatingHeader() {
  const { pageType, setPageType, closeOverPage } = React.useContext(OverPageContext);
  const { focusedChannelId, selfChannels } = React.useContext(SidebarContext);
  const [secondaryData, setSecondaryData] = React.useState(0)
  const { pathname } = useLocation()
  const hiveApi = new HiveApi()

  React.useEffect(()=>{
    if(pathname.startsWith('/channel') && focusedChannelId) {
      const prefConf = getAppPreference()
      hiveApi.querySelfPostsByChannel(focusedChannelId.toString())
        .then((res)=>{
          if(Array.isArray(res)) {
            setSecondaryData(
              prefConf.DP?
              res.length:
              res.filter(item=>!item.status).length
            )
          }
        })
    }
  }, [focusedChannelId])

  const handleClose = (e) => {

  }
  
  const getActionText = () => {
    let primaryText = ""
    let secondaryText = ""
    
    if(pathname.startsWith('/setting')) {
      const suburl = pathname.substring(8)
      const menuType = SettingMenuArray.find(item=>item.to===suburl)
      const description = menuType?menuType.description:''

      primaryText = "Settings"
      secondaryText = description
    }
    else if(pathname.startsWith('/channel') && focusedChannelId) {
      const focusedChannel = selfChannels.find(item=>item.channel_id==focusedChannelId)
      primaryText = focusedChannel.name
      secondaryText = `${secondaryData} post`
    }
    else if(pageType==='AddChannel')
      primaryText = "Add Channel"
    else if(pageType==='Profile') {
      primaryText = "asralf"
      // secondaryText = "0 post"
    }
    if(primaryText) {
      const listItemProps = { primary: <Typography variant='subtitle2' color='text.primary' textAlign='left'>{primaryText}</Typography> }
      if(secondaryText)
        listItemProps['secondary'] = secondaryText
      return <ListItemText {...listItemProps}/>
    }
    return ""
  }

  const backBtnText = React.useMemo(() => getActionText(), [pageType, pathname, focusedChannelId, secondaryData])
  return (
    <>
      <Hidden lgDown>
        <Box sx={{pb: (theme)=>`${theme.header.height}`}}>
          <HeaderWrapper>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
            >
              {
                !!backBtnText&&
                <Button
                  color="inherit"
                  startIcon={<ArrowBack />}
                  onClick={handleClose}
                  sx={{textAlign: 'left'}}
                >
                  {backBtnText}
                </Button>
              }
            </Stack>
          </HeaderWrapper>
        </Box>
      </Hidden>
    </>
  );
}

export default FloatingHeader;
