import { useState, useContext, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import parse from 'html-react-parser';
import { Icon } from '@iconify/react';
import AddIcon from '@mui/icons-material/Add';
import ShareIcon from '@mui/icons-material/ShareOutlined';
import { Box, Drawer, alpha, styled, Divider, useTheme, Button, Stack, Popper, ClickAwayListener, Tooltip, Fab, Typography, Paper, IconButton } from '@mui/material';

import Scrollbar from 'src/components/Scrollbar';
import Logo from 'src/components/LogoSign';
import ChannelAvatar from 'src/components/ChannelAvatar'
import StyledButton from 'src/components/StyledButton'
import PostDlg from 'src/components/Modal/Post';
import { SidebarContext } from 'src/contexts/SidebarContext';
import { OverPageContext } from 'src/contexts/OverPageContext';
import { CommonStatus } from 'src/models/common_content'
import { reduceDIDstring, getAppPreference, sortByDate, getFilteredArrayByUnique, getInfoFromDID, isValidTime, getDateDistance, convertAutoLink } from 'src/utils/common'
import { HiveApi } from 'src/services/HiveApi'

const SidebarWrapper = styled(Box)(
  ({ theme }) => `
        width: ${theme.sidebarChannel.width};
        min-width: ${theme.sidebarChannel.width};
        color: ${theme.colors.alpha.trueWhite[70]};
        position: relative;
        z-index: 7;
        height: 100%;
        // padding-bottom: 68px;
`
);
const GradientOutlineFab = styled(Fab)(
  ({ theme }) => `
    &:before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 50%; 
      border-style: dotted;
      background: linear-gradient(90deg, #7624FE 0%, #368BFF 100%) border-box;
      -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
              mask-composite: exclude; 
      transition: border-radius .2s
    }
    &:hover {
      border-radius: 16px;
      background: ${theme.colors.default.main};
    }
    &:hover:before {
      border-style: unset;
      padding: 2px;
      border-radius: 16px;
    }
    &:hover svg.MuiSvgIcon-root {
      fill: white;
    }
    background: transparent;
`
);
const GradientFab = styled(Fab)(
  ({ theme }) => `
    background: linear-gradient(90deg, #7624FE 0%, #368BFF 100%);
`
);
const StyledPopper = styled(Popper)(({ theme }) => ({ // You can replace with `PopperUnstyled` for lower bundle size.
  maxWidth: '350px',
  width: '100%',
  '&[data-popper-placement*="bottom"] .arrow': {
    top: 0,
    left: 0,
    marginTop: '-0.9em',
    width: '3em',
    height: '1em',
    '&::before': {
      borderWidth: '0 1em 1em 1em',
      borderColor: `transparent transparent ${theme.palette.background.paper} transparent`,
    },
  },
  '&[data-popper-placement*="top"] .arrow': {
    bottom: 0,
    left: 0,
    marginBottom: '-0.9em',
    width: '3em',
    height: '1em',
    '&::before': {
      borderWidth: '1em 1em 0 1em',
      borderColor: `${theme.palette.background.paper} transparent transparent transparent`,
    },
  },
  '&[data-popper-placement*="right"] .arrow': {
    left: 0,
    marginLeft: '-0.9em',
    height: '3em',
    width: '1em',
    '&::before': {
      borderWidth: '1em 1em 1em 0',
      borderColor: `transparent ${theme.palette.background.paper} transparent transparent`,
    },
  },
  '&[data-popper-placement*="left"] .arrow': {
    right: 0,
    marginRight: '-0.9em',
    height: '3em',
    width: '1em',
    '&::before': {
      borderWidth: '1em 0 1em 1em',
      borderColor: `transparent transparent transparent ${theme.palette.background.paper}`,
    },
  },
}));

function SidebarChannel() {
  const { selfChannels, postsInSelf, sidebarToggle, focusedChannelId, subscriberInfo, setSelfChannels, setPostsInSelf, toggleSidebar, setFocusChannelId, setSubscriberInfo } = useContext(SidebarContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isOpenPopover, setOpenPopover] = useState(false);
  const [popoverChannel, setPopoverChannel] = useState({});
  const [recentPosts, setRecentPosts] = useState([]);
  const [arrowRef, setArrowRef] = useState(null);
  const [isOpenPost, setOpenPost] = useState(false)
  const closeSidebar = () => toggleSidebar();
  const theme = useTheme();
  const { pathname } = useLocation();
  const hiveApi = new HiveApi()
  const prefConf = getAppPreference()
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const userDid = `did:elastos:${feedsDid}`
  const navigate = useNavigate();
  
  useEffect(()=>{
    hiveApi.querySelfChannels()
      .then(res=>{
        // console.log(res, '-----------self')
        if(Array.isArray(res)){
          const selfChannels = 
            res
              .filter(item=>item.status!=CommonStatus.deleted)
              .map(item=>{
                item.target_did = userDid
                return item
              })
          setSelfChannels(selfChannels)
          if(selfChannels.length)
            setFocusChannelId(res[0].channel_id)

          selfChannels.forEach(item=>{
            hiveApi.querySubscriptionInfoByChannelId(userDid, item.channel_id)
              .then(subscriptionRes=>{
                if(subscriptionRes['find_message']) {
                  const subscribersArr = subscriptionRes['find_message']['items']
                  subscribersArr.forEach((subscriber, _i)=>{
                    if(subscriberInfo[subscriber.user_did] === undefined) {
                      setSubscriberInfo((prev)=>{
                        const tempState = {...prev}
                        tempState[subscriber.user_did] = {}
                        return tempState
                      })
                      getInfoFromDID(subscriber.user_did).then(res=>{
                        setSubscriberInfo((prev)=>{
                          const tempState = {...prev}
                          tempState[subscriber.user_did]['info'] = res
                          return tempState
                        })
                      })
                      hiveApi.getHiveUrl(subscriber.user_did)
                        .then(async hiveUrl=>{
                          try {
                            const response =  await hiveApi.downloadFileByHiveUrl(subscriber.user_did, hiveUrl)
                            if(response && response.length) {
                              const base64Content = response.toString('base64')
                              setSubscriberInfo((prev)=>{
                                const tempState = {...prev}
                                tempState[subscriber.user_did]['avatar'] = `data:image/png;base64,${base64Content}`
                                return tempState
                              })
                            }
                          } catch(err) {}
                        })
                    }
                  })
                  setSelfChannels(prevState=>{
                    const tempState = [...prevState]
                    const channelIndex = tempState.findIndex(el=>el.channel_id==item.channel_id)
                    if(channelIndex>=0)
                      tempState[channelIndex]['subscribers'] = subscribersArr
                    return tempState
                  })
                }
              })
            hiveApi.queryPostByChannelId(item.target_did, item.channel_id)
              .then(postRes=>{
                if(postRes['find_message'] && postRes['find_message']['items']) {
                  const postArr = prefConf.DP?
                    postRes['find_message']['items']:
                    postRes['find_message']['items'].filter(postItem=>postItem.status!==CommonStatus.deleted)
                  const splitTargetDid = item.target_did.split(':')
                  postArr.map(post=>{
                    post.target_did = splitTargetDid[splitTargetDid.length-1]
                    if(typeof post.created == 'object')
                      post.created = new Date(post.created['$date']).getTime()/1000
                  })
                  postArr.forEach(post=>{
                    const contentObj = JSON.parse(post.content)
                    contentObj.mediaData.forEach((media, _i)=>{
                      if(!media.originMediaPath)
                        return
                      hiveApi.downloadScripting(item.target_did, media.originMediaPath)
                        .then(res=>{
                          if(res) {
                            setPostsInSelf((prevState) => {
                              const tempState = {...prevState}
                              const currentGroup = tempState[item.channel_id]
                              const postIndex = currentGroup.findIndex(el=>el.post_id==post.post_id)
                              if(postIndex<0)
                                return tempState
                              if(currentGroup[postIndex].mediaData)
                                currentGroup[postIndex].mediaData.push({...media, mediaSrc: res})
                              else
                                currentGroup[postIndex].mediaData = [{...media, mediaSrc: res}]
                              return tempState
                            })
                          }
                        })
                        .catch(err=>{
                          console.log(err)
                        })
                    })
                    hiveApi.queryLikeById(item.target_did, item.channel_id, post.post_id, '0')
                      .then(likeRes=>{
                        if(likeRes['find_message'] && likeRes['find_message']['items']) {
                          const likeArr = likeRes['find_message']['items']
                          const filteredLikeArr = getFilteredArrayByUnique(likeArr, 'creater_did')
                          const likeIndexByMe = filteredLikeArr.findIndex(item=>item.creater_did==userDid)
  
                          setPostsInSelf((prevState) => {
                            const tempState = {...prevState}
                            const currentGroup = tempState[item.channel_id]
                            const postIndex = currentGroup.findIndex(el=>el.post_id==post.post_id)
                            if(postIndex<0)
                              return tempState
                            currentGroup[postIndex].likes = filteredLikeArr.length
                            currentGroup[postIndex].like_me = likeIndexByMe>=0
                            return tempState
                          })
                        }
                        // console.log(likeRes, "--------------5", post)
                      })
                  })
                  const postIds = postArr.map(post=>post.post_id)
                  hiveApi.queryCommentsFromPosts(item.target_did, item.channel_id, postIds)
                    .then(commentRes=>{
                      if(commentRes['find_message'] && commentRes['find_message']['items']) {
                        const commentArr = commentRes['find_message']['items']
                        const ascCommentArr = sortByDate(commentArr, 'asc')
                        const linkedComments = ascCommentArr.reduce((res, item)=>{
                          if(item.refcomment_id == '0') {
                              res.push(item)
                              return res
                          }
                          const tempRefIndex = res.findIndex((c) => c.comment_id == item.refcomment_id)
                          if(tempRefIndex<0){
                              res.push(item)
                              return res
                          }
                          if(res[tempRefIndex]['commentData'])
                              res[tempRefIndex]['commentData'].push(item)
                          else res[tempRefIndex]['commentData'] = [item]
                          return res
                        }, []).reverse()
                      
                        linkedComments.forEach(comment=>{
                          setPostsInSelf((prevState) => {
                            const tempState = {...prevState}
                            const currentGroup = tempState[item.channel_id]
                            const postIndex = currentGroup.findIndex(el=>el.post_id==comment.post_id)
                            if(postIndex<0)
                              return tempState
                            if(currentGroup[postIndex].commentData)
                              currentGroup[postIndex].commentData.push(comment)
                            else
                              currentGroup[postIndex].commentData = [comment]
                            return tempState
                          })
                        })
                      }
                      // console.log(commentRes, "--------------6")
                    })
                  setPostsInSelf((prevState) => {
                    const tempState = {...prevState}
                    tempState[item.channel_id] = sortByDate(postArr)
                    return tempState
                  })
                  // console.log(postArr, "---------------------3")
                }
              })
              .catch(err=>{
                // console.log(err, item)
              })
            hiveApi.queryUserDisplayName(item.target_did, item.channel_id, userDid)
              .then(dispnameRes=>{
                if(dispnameRes['find_message'] && dispnameRes['find_message']['items'].length) {
                  const dispName = dispnameRes['find_message']['items'][0].display_name
                  setSelfChannels(prevState=>{
                    const tempState = [...prevState]
                    const channelIndex = tempState.findIndex(el=>el.channel_id==item.channel_id)
                    if(channelIndex>=0)
                      tempState[channelIndex]['owner_name'] = dispName
                    return tempState
                  })
                }
              })
          })
        }
      })
      .catch(err=>{
        console.log(err)
      })
  }, [])

  const handleClickChannel = (item)=>{
    setFocusChannelId(item.channel_id); 
  }
  const handleRightClickChannel = (e, item)=>{
    e.preventDefault()
    handlePopoverOpen(e, item)
  }
  const handlePopoverOpen = (event, item) => {
    setAnchorEl(event.currentTarget)
    setPopoverChannel(item)
    setOpenPopover(true);
    const postsInChannel = postsInSelf[item.channel_id]
    if(postsInChannel) {
      setRecentPosts(
        postsInChannel
        .slice(0, 2)
        .map(post=>{
          const distanceTime = isValidTime(post.created_at)?getDateDistance(post.created_at):''
          if(post.status == 1)
            post.content_filtered = "(post deleted)"
          else {
            const contentObj = JSON.parse(post.content)
            post.content_filtered = convertAutoLink(contentObj.content)
          }
          post.distanceTime = distanceTime
          return post
        })
      )
    }
  };
  const handlePopoverClose = () => {
    setOpenPopover(false);
  };
  const handleClickPost = (e) => {
    setOpenPopover(false);
    setOpenPost(true)
  }
  const styles = {
    arrow: {
        position: 'absolute',
        fontSize: 7,
        width: '3em',
        height: '3em',
        '&::before': {
          content: '""',
          margin: 'auto',
          display: 'block',
          width: 0,
          height: 0,
          borderStyle: 'solid',
        },
    }
  };

  return (
    <>
      <SidebarWrapper
        sx={{
          display: 'table',
          boxShadow: theme.palette.mode === 'dark' ? theme.sidebar.boxShadow : 'none'
        }}
      >
        <Box sx={{ display: 'table-row', height: '100%' }}>
          <Scrollbar>
            <Box mt={3} textAlign='center'>
              <Logo width={48} />
            </Box>
            <Divider
              sx={{
                mt: theme.spacing(2),
                mx: theme.spacing(2),
                background: theme.colors.alpha.trueWhite[10]
              }}
            />
            <Stack spacing={2} mt={2} alignItems='center'>
              {
                selfChannels.map((item, _i)=>
                  <ChannelAvatar 
                    key={_i} 
                    index={_i}
                    channel={item}
                    onClick={(e)=>{handleClickChannel(item)}} 
                    onRightClick={(e)=>{handleRightClickChannel(e, item)}} 
                    focused={focusedChannelId&&focusedChannelId===item.channel_id}/>
                )
              }
              <GradientOutlineFab aria-label="add" size='medium' onClick={()=>{navigate('/channel/add')}}>
                <svg width={0} height={0}>
                  <linearGradient id="linearColors" x1={0} y1={1} x2={1} y2={1}>
                    <stop offset={0} stopColor="#7624FE" />
                    <stop offset={1} stopColor="#368BFF" />
                  </linearGradient>
                </svg>
                <AddIcon sx={{ fill: "url(#linearColors)", fontSize: 24 }}/>
              </GradientOutlineFab>
            </Stack>
          </Scrollbar>
        </Box>
        <Stack spacing={2} alignItems='center' sx={{py: 2}}>
          <Fab 
            color='primary' 
            aria-label="setting" 
            size='medium' 
            component={RouterLink} 
            to='/setting/profile' 
            sx={
              pathname.startsWith('/setting') ? { background: 'linear-gradient(90deg, #7624FE 0%, #368BFF 100%)'} : {}
            }>
            <Icon icon="ep:setting" width={28} height={28} />
          </Fab>
          <Fab color='primary' aria-label="logout" size='medium'>
            <Icon icon="clarity:sign-out-line" width={28} height={28} />
          </Fab>
        </Stack>
      </SidebarWrapper>
      <ClickAwayListener onClickAway={() => handlePopoverClose()}>
        <StyledPopper
          anchorEl={anchorEl}
          open={isOpenPopover}
          placement="right-start"
          disablePortal={false}
          modifiers={[
            {
              name: 'flip',
              enabled: true,
              options: {
                altBoundary: true,
                rootBoundary: 'document',
                padding: 8,
              },
            },
            {
              name: 'preventOverflow',
              enabled: false,
              options: {
                altAxis: true,
                altBoundary: true,
                tether: true,
                rootBoundary: 'document',
                padding: 8,
              },
            },
            {
              name: 'arrow',
              enabled: true,
              options: {
                element: arrowRef,
              },
            },
          ]}
          sx={{zIndex: 100}}
        >
          <Box component="span" className="arrow" ref={setArrowRef} sx={styles.arrow} />
          <Paper sx={{p: 2}}>
            <Stack direction="row">
              <Typography variant="h5" pb={2} flex={1}>{popoverChannel['name']}</Typography>
              <Box sx={{display: 'inline-block'}}>
                <IconButton sx={{borderRadius: '50%', backgroundColor: (theme)=>theme.colors.primary.main, mr: 1}} size='small'><Icon icon="ant-design:share-alt-outlined" /></IconButton>
                <IconButton sx={{borderRadius: '50%', backgroundColor: (theme)=>theme.colors.primary.main}} size='small'><Icon icon="clarity:note-edit-line" /></IconButton>
              </Box>
            </Stack>
            <Typography variant="body1" component='div' sx={{display: 'flex'}}><Icon icon="clarity:group-line" fontSize='20px' />&nbsp;{popoverChannel['subscribers']?popoverChannel['subscribers'].length:0} Subscribers</Typography>
            <Typography variant="h6" py={1}>Recent Posts</Typography>
            {
              recentPosts.map((post, _i)=>(
                <Box key={_i}>
                  <Typography variant="body2" color='text.secondary'>{parse(post.content_filtered)}</Typography>
                  <Typography variant="body2" textAlign='right'>{post.distanceTime}</Typography>
                  {
                    _i<recentPosts.length-1 &&
                    <Divider sx={{mb: 1}}/>
                  }
                </Box>
              ))
            }
            {
              !recentPosts.length &&
              <Typography variant="body2" py={1}>No recent post found</Typography>
            }
            {/* <Typography variant="body2" color='text.secondary'>Good weather today in Osaka! Hmm... where should I eat in Tennouji? Any recommendations? I’m thinking of eating raw sushi for the first time though... I hope it’s gonna be alright haha#osaka #japan #spring</Typography>
            <Typography variant="body2" textAlign='right'>1d</Typography> */}
            <Box sx={{display: 'block'}} textAlign="center" p={2}>
              <StyledButton type="contained" fullWidth onClick={handleClickPost}>Post</StyledButton>
            </Box>
          </Paper>
        </StyledPopper>
      </ClickAwayListener>
      <PostDlg setOpen={setOpenPost} isOpen={isOpenPost} activeChannelId={popoverChannel['channel_id']}/>
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
          </Scrollbar>
        </SidebarWrapper>
      </Drawer> */}
    </>
  );
}

export default SidebarChannel;
