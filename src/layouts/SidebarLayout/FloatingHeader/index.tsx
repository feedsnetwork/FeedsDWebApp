import React from 'react';
import { useSelector } from 'react-redux'
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Stack, Box, Button, Hidden, ListItemText, Typography, styled, alpha, lighten } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';

import ChannelName from 'components/ChannelName';
import { OverPageContext } from 'contexts/OverPageContext';
import { selectVisitedChannelId, selectFocusedChannelId, selectChannelById } from 'redux/slices/channel';
import { selectMyName, selectUserInfoByDID } from 'redux/slices/user';
import { selectQueryPublicStep, selectQueryStep } from 'redux/slices/proc';
import { SettingMenuArray, reduceDIDstring, filterSelfComment } from 'utils/common'
import { getLocalDB } from 'utils/db';

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
  const { pathname } = useLocation()
  const location = useLocation()
  const navigate = useNavigate();
  const params = useParams()
  const { user_did } = (location.state || {}) as any
  const feedsDid = localStorage.getItem('FEEDS_DID')
  const visitedChannelId = useSelector(selectVisitedChannelId)
  const myName = useSelector(selectMyName)
  const userInfo = useSelector(selectUserInfoByDID(user_did)) || {}
  const focusedChannelId = useSelector(selectFocusedChannelId)
  let selectedChannelId = focusedChannelId
  const isSubscribedChannel = pathname.startsWith('/subscription/channel')? true: false
  const isPublicChannel = pathname.startsWith('/explore/channel')? true: false
  if(isSubscribedChannel || isPublicChannel)
    selectedChannelId = visitedChannelId
  const focusedChannel = useSelector(selectChannelById(selectedChannelId)) || {}
  const currentPostStep = useSelector(selectQueryStep('post_data'))
  const currentPublicPostStep = useSelector(selectQueryPublicStep('post_data'))
  const [postCountInFocus, setPostCountInFocus] = React.useState(0)
  const [activeCommentCount, setActiveCommentCount] = React.useState(0)
  const LocalDB = getLocalDB()

  React.useEffect(()=>{
    if(selectedChannelId) {
      setPostCountInFocus(0)
      if((currentPostStep && !isPublicChannel) || (currentPublicPostStep && isPublicChannel))
        LocalDB.find({
          selector: {
            channel_id: selectedChannelId,
            table_type: 'post'
          }
        })
          .then(res=>setPostCountInFocus(res.docs.length))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPostStep, currentPublicPostStep, selectedChannelId])

  React.useEffect(()=>{
    if(params.post_id) {
      setActiveCommentCount(0)
      LocalDB.find({
        selector: {
          table_type: {$in: ['comment', 'post']},
          post_id: params.post_id,
          $or: [
            {
              refcomment_id: {$exists: false}
            },
            {
              refcomment_id: '0'
            }
          ]
        }
      })
        .then(res=>{
          let filteredDocs = filterSelfComment(res.docs)
          setActiveCommentCount(filteredDocs.length)
        })
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
    let primaryText = null
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
      primaryText = <ChannelName name={focusedChannel['display_name']} isPublic={focusedChannel['is_public']} variant="div" />
      secondaryText = `${postCountInFocus} posts`
    }
    else if(pathname.startsWith('/post/')) {
      primaryText = "Post"
      secondaryText = `${activeCommentCount} comments`
    }
    else if(pathname.startsWith('/profile')) {
      if(pathname.startsWith('/profile/others')) {
        primaryText = userInfo['name'] || `@${reduceDIDstring(user_did)}`
      }
      else
        primaryText = myName || `@${reduceDIDstring(feedsDid)}`
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
