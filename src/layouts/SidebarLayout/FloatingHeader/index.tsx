import React from 'react';
import { useSelector } from 'react-redux'
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Stack, Box, Button, Hidden, ListItemText, Typography, styled, alpha, lighten } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';

import { SidebarContext } from 'contexts/SidebarContext';
import { OverPageContext } from 'contexts/OverPageContext';
import { selectVisitedChannelId, selectPublicChannels } from 'redux/slices/channel';
import { selectPublicPosts } from 'redux/slices/post';
import { selectMyInfo } from 'redux/slices/user';
import { LocalDB, QueryStep } from 'utils/db';
import { SettingMenuArray, reduceDIDstring } from 'utils/common'

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
  const { pageType } = React.useContext(OverPageContext);
  const { queryStep, focusedChannelId } = React.useContext(SidebarContext);
  const { pathname } = useLocation()
  const navigate = useNavigate();
  const params = useParams()
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const visitedChannelId = useSelector(selectVisitedChannelId)
  const publicChannels = useSelector(selectPublicChannels)
  const publicPosts = useSelector(selectPublicPosts)
  const myInfo = useSelector(selectMyInfo)
  const [focusedChannel, setFocusedChannel] = React.useState({})
  const [postCountInFocus, setPostCountInFocus] = React.useState(0)
  const [focusedPost, setFocusedPost] = React.useState({})
  const selectedChannelId = visitedChannelId || focusedChannelId

  React.useEffect(()=>{
    if(queryStep && selectedChannelId) {
      LocalDB.get(selectedChannelId.toString())
        .then(doc=>setFocusedChannel(doc))
      if(queryStep >= QueryStep.post_data) {
        LocalDB.find({
          selector: {
            channel_id: selectedChannelId,
            table_type: 'post'
          }
        })
          .then(res=>setPostCountInFocus(res.docs.length))
      }
    }
  }, [queryStep, selectedChannelId])

  React.useEffect(()=>{
    if(params.post_id) {
      LocalDB.get(params.post_id.toString())
        .then(doc=>setFocusedPost(doc))
    }
  }, [params])
  
  const handleBack = (e) => {
    if(pathname.startsWith('/setting')) {
      navigate('/home')
    }
    else
      window.history.back()
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
    else if(
      (pathname.startsWith('/channel') && focusedChannelId) ||
      (pathname.startsWith('/subscription/channel') && visitedChannelId)
    ) {
      primaryText = focusedChannel['name']
      secondaryText = `${postCountInFocus} posts`
    }
    else if(pathname.startsWith('/explore/channel') && visitedChannelId) {
      const activeChannel = (publicChannels[visitedChannelId] || {}) as any
      const postsInActiveChannel = publicPosts[visitedChannelId] || []
      primaryText = activeChannel.name
      secondaryText = `${postsInActiveChannel.length} posts`
    }
    else if(pathname.startsWith('/post/')) {
      primaryText = "Post"
      secondaryText = `${focusedPost['commentData']?.length || 0} comments`
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
  }, [pageType, pathname, focusedChannel, postCountInFocus])
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
