import React from 'react';
import { useSelector } from 'react-redux'
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Stack, Box, Button, Hidden, ListItemText, Typography, styled, alpha, lighten } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';

import { SidebarContext } from 'contexts/SidebarContext';
import { OverPageContext } from 'contexts/OverPageContext';
import { selectVisitedChannelId, selectFocusedChannelId } from 'redux/slices/channel';
import { selectMyInfo } from 'redux/slices/user';
import { getLocalDB, QueryStep } from 'utils/db';
import { SettingMenuArray, reduceDIDstring } from 'utils/common'

const HeaderWrapper = styled(Box)(
  ({ theme }) => `
        height: ${theme.header.height};
        color: ${theme.header.textColor};
        padding: ${theme.spacing(0, 2)};
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
function FloatingHeader(props) {
  const { rightPanelVisible } = props
  const { pageType, closeOverPage } = React.useContext(OverPageContext);
  const { queryStep, queryPublicStep } = React.useContext(SidebarContext);
  const { pathname } = useLocation()
  const navigate = useNavigate();
  const params = useParams()
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const visitedChannelId = useSelector(selectVisitedChannelId)
  const myInfo = useSelector(selectMyInfo)
  const focusedChannelId = useSelector(selectFocusedChannelId)
  const [focusedChannel, setFocusedChannel] = React.useState({})
  const [postCountInFocus, setPostCountInFocus] = React.useState(0)
  const [activeCommentCount, setActiveCommentCount] = React.useState(0)
  const LocalDB = getLocalDB()

  React.useEffect(()=>{
    let selectedChannelId = focusedChannelId
    const isSubscribedChannel = pathname.startsWith('/subscription/channel')? true: false
    const isPublicChannel = pathname.startsWith('/explore/channel')? true: false
    if(isSubscribedChannel || isPublicChannel)
      selectedChannelId = visitedChannelId

    if(selectedChannelId) {
      if((queryStep && !isPublicChannel) || (queryPublicStep && isPublicChannel))
        LocalDB.get(selectedChannelId)
          .then(doc=>{
            setFocusedChannel(doc)
          })
      if((queryStep>=QueryStep.post_data && !isPublicChannel) || (queryPublicStep>=QueryStep.post_data && isPublicChannel))
        LocalDB.find({
          selector: {
            channel_id: selectedChannelId,
            table_type: 'post'
          }
        })
          .then(res=>setPostCountInFocus(res.docs.length))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryStep, queryPublicStep, focusedChannelId, visitedChannelId, pathname])

  React.useEffect(()=>{
    if(params.post_id) {
      LocalDB.find({
        selector: {
          table_type: 'comment',
          post_id: params.post_id
        }
      })
        .then(res=>setActiveCommentCount(res.docs.length))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])
  
  const handleBack = (e) => {
    if(pathname.startsWith('/setting'))
      navigate('/home')
    else if(!pathname.startsWith('/home'))
      window.history.back()
    else
      closeOverPage()
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
    else if(pathname.startsWith('/channel/add') || pageType==='AddChannel')
      primaryText = "Add Channel"
    else if(pathname.startsWith('/channel/edit'))
      primaryText = "Edit Channel"
    else if(
      (pathname.startsWith('/channel') && focusedChannelId) ||
      ((pathname.startsWith('/subscription/channel') || pathname.startsWith('/explore/channel')) && visitedChannelId)
    ) {
      primaryText = focusedChannel['display_name']
      secondaryText = `${postCountInFocus} posts`
    }
    else if(pathname.startsWith('/post/')) {
      primaryText = "Post"
      secondaryText = `${activeCommentCount} comments`
    }
    else if(pathname.startsWith('/profile')) {
      primaryText = myInfo['name'] || `@${reduceDIDstring(feedsDid)}`
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

  const backBtnText = React.useMemo(() => {
    return getActionText()
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageType, pathname, focusedChannel, postCountInFocus, activeCommentCount])
  return (
    <>
      <Hidden lgDown>
        <Box sx={{pb: (theme)=>`${theme.header.height}`}}>
          <HeaderWrapper sx={{right: (theme)=>rightPanelVisible? theme.rightPanel.width: 0}}>
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
                  onClick={handleBack}
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
