import React from 'react'
import { NavLink as RouterLink, useNavigate } from 'react-router-dom'
import { Box, Stack, Typography, IconButton, Popper, Paper, styled, Divider, AvatarGroup, Fade, Menu, MenuItem, Link } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
import parse from 'html-react-parser';
import Odometer from "react-odometerjs";
import "odometer/themes/odometer-theme-default.css";

import StyledAvatar from 'src/components/StyledAvatar'
import CommentDlg from 'src/components/Modal/Comment'
import PostDlg from 'src/components/Modal/Post'
import DeletePostDlg from 'src/components/Modal/DeletePost'
import UnsubscribeDlg from 'src/components/Modal/Unsubscribe'
import StyledButton from 'src/components/StyledButton'
import Heart from 'src/components/Heart'
import { SidebarContext } from 'src/contexts/SidebarContext';
import { CommonStatus } from 'src/models/common_content'
import { getDateDistance, isValidTime, hash, convertAutoLink, getPostShortUrl, copy2clipboard } from 'src/utils/common'
import { HiveApi } from 'src/services/HiveApi'


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

const IconInCircle = (props)=>{
  const {name, stress=false} = props
  return (
    <Box sx={{p: .8, background: stress?'#FF453A':(theme)=>theme.palette.primary.main, borderRadius: '50%', display: 'flex', mr: 2, color: stress?'#161C24':'#C4C4C4'}}>
      <Icon icon={name} width={18} height={18}/>
    </Box>
  )
}

const PostBody = (props) => {
  const { post, contentObj, isReply=false, level=1, direction } = props
  const distanceTime = isValidTime(post.created_at)?getDateDistance(post.created_at):''
  const { selfChannels, subscribedChannels, subscriberInfo, setFocusChannelId } = React.useContext(SidebarContext);
  const [isLike, setIsLike] = React.useState(!!post.like_me)
  const [isOpenComment, setOpenComment] = React.useState(false)
  const [isOpenPost, setOpenPost] = React.useState(false)
  const [isOpenDelete, setOpenDelete] = React.useState(false)
  const [isOpenUnsubscribe, setOpenUnsubscribe] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isOpenPopover, setOpenPopover] = React.useState(false);
  const [isEnterPopover, setEnterPopover] = React.useState(false);
  const [isOpenPopup, setOpenPopup] = React.useState(null);
  const hiveApi = new HiveApi()
  const isOwnedChannel = selfChannels.findIndex(item=>item.channel_id==post.channel_id)>=0
  const currentChannel = [...selfChannels, ...subscribedChannels].find(item=>item.channel_id==post.channel_id) || {}
  const subscribersOfThis = currentChannel['subscribers'] || []
  const subscribedByWho = `Subscribed by ${subscribersOfThis.slice(0,3).map(subscriber=>subscriber.display_name).join(', ')}${subscribersOfThis.length>3?' and more!':'.'}`
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const userDid = `did:elastos:${feedsDid}`
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(()=>{
    setIsLike(!!post.like_me)
  }, [post.like_me])

  const handleCommentDlg = (e) => {
    e.stopPropagation()
    if(post.status !== CommonStatus.deleted)
      setOpenComment(true)
  }

  const handleLike = async (e) => {
    e.stopPropagation()
    if(isSaving || post.status === CommonStatus.deleted)
      return
    setIsSaving(true)
    try {
      if(!isLike) {
        const likeId = hash(`${post.post_id}${post.comment_id}${userDid}`)
        await hiveApi.addLike(currentChannel.target_did, likeId, post.channel_id, post.post_id, post.comment_id || '0')
      } else {
        await hiveApi.removeLike(currentChannel.target_did, post.channel_id, post.post_id, post.comment_id || '0')
      }
      setIsLike(!isLike)
      setIsSaving(false)
    } catch(err) {
      setIsSaving(false)
      enqueueSnackbar('Like action error', { variant: 'error' });
    }
  }

  const filteredContentByLink = convertAutoLink(contentObj.content)
  const handleClickInContent = (e)=>{
    if(e.target.className.includes('outer-link'))
      e.stopPropagation()
  }

  const handlePopper = (e, open)=>{
    if(open)
      setAnchorEl(e.target)
    setOpenPopover(open)
  }

  const openPopupMenu = (event) => {
    event.stopPropagation()
    setOpenPopup(event.currentTarget);
  };

  const handleClosePopup = (event) => {
    event.stopPropagation()
    const type = event.currentTarget.getAttribute("value")
    switch(type){
      case 'share':
        getPostShortUrl(post)
          .then(shortUrl=>{
            copy2clipboard(shortUrl)
              .then(_=>{
                enqueueSnackbar('Copied to clipboard', { variant: 'success' });
              })
          })
        break;
      case 'edit':
        setOpenPost(true)
        break;
      case 'delete':
        setOpenDelete(true)
        break;
      case 'unsubscribe':
        setOpenUnsubscribe(true)
        break;
      default:
        break;
    }
    setOpenPopup(null);
  };
  const handleLink2Channel = (e)=>{
    e.stopPropagation()
    const isSelfChannel = selfChannels.findIndex(item=>item.channel_id==post.channel_id)>=0
    if(isSelfChannel) {
      setFocusChannelId(post.channel_id)
      navigate('/channel')
    } else {
      navigate('/subscription/channel', {state: {channel_id: post.channel_id}});
    }
  }
  const handleLink2Profile = (e)=>{
    e.stopPropagation()
    const isSelf = post.target_did == feedsDid
    if(isSelf) {
      navigate('/profile')
    } else {
      navigate('/profile/others', {state: {user_did: `did:elastos:${post.target_did}`}});
    }
  }
  return (
    <>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            onMouseEnter={(e)=>{handlePopper(e, true)}}
            onMouseLeave={(e)=>{handlePopper(e, false)}}
            onClick={level==1?handleLink2Channel:null}
          >
            <StyledAvatar alt={contentObj.avatar.name} src={contentObj.avatar.src} width={isReply?40:47}/>
          </Box>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography component='div' variant="subtitle2" noWrap>
              {
                level==1?
                <Link sx={{color:'inherit'}} onClick={handleLink2Channel}>
                  {contentObj.primaryName}
                </Link>:

                contentObj.primaryName
              }
              {' '}<Typography variant="body2" color="text.secondary" sx={{display: 'inline'}}>{distanceTime}</Typography>
            </Typography>
            <Typography variant="body2" noWrap>
              {
                level==1?
                <Link sx={{color:'inherit'}} onClick={handleLink2Profile}>
                  {contentObj.secondaryName}
                </Link>:

                contentObj.secondaryName
              }  
            </Typography>
          </Box>
          {
            !isReply && post.status !== CommonStatus.deleted &&
            <Box>
              <IconButton aria-label="settings" size='small' onClick={openPopupMenu}>
                <MoreVertIcon />
              </IconButton>
              <Menu 
                keepMounted
                id="simple-menu"
                anchorEl={isOpenPopup}
                onClick={(e)=>{e.stopPropagation()}}
                onClose={handleClosePopup}
                open={Boolean(isOpenPopup)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                {
                  isOwnedChannel?
                  <div>
                    <MenuItem value='share' onClick={handleClosePopup}>
                      <IconInCircle name='clarity:share-line'/>&nbsp;
                      <Typography variant="subtitle2">Copy Link to Share</Typography>
                    </MenuItem>
                    <MenuItem value='edit' onClick={handleClosePopup}>
                      <IconInCircle name='clarity:note-edit-line'/>&nbsp;
                      <Typography variant="subtitle2">Edit Post</Typography>
                    </MenuItem>
                    <MenuItem value='delete' onClick={handleClosePopup}>
                      <IconInCircle name='fa6-solid:trash-can' stress={true}/>&nbsp;
                      <Typography variant="subtitle2" color="#FF453A">Delete Post</Typography>
                    </MenuItem>
                  </div>:

                  <div>
                    <MenuItem value='share' onClick={handleClosePopup}>
                      <IconInCircle name='clarity:share-line'/>&nbsp;
                      <Typography variant="subtitle2">Copy Link to Share</Typography>
                    </MenuItem>
                    <MenuItem value='unsubscribe' onClick={handleClosePopup}>
                      <IconInCircle name='clarity:user-solid-alerted' stress={true}/>&nbsp;
                      <Typography variant="subtitle2" color="#FF453A">Unsubscribe</Typography>
                    </MenuItem>
                  </div>
                }
              </Menu>
            </Box>
          }
        </Stack>
        <Stack direction={direction} spacing={(post.mediaData && post.mediaData.length>0) ?2 :0}>
          <Typography 
            variant="body2" 
            onClick={handleClickInContent}
            sx={{
              flexGrow: 1,
              whiteSpace: 'pre-line', 
              '& a.outer-link': {
                color: '#368BFF', 
                textDecoration: 'none'
              }
            }}
          >
            {parse(filteredContentByLink)}
          </Typography>
          <Box>
            {
              !!post.mediaData && post.mediaData.map((media, _i)=>(
                media.kind == 'image'?
                <Box component='img' src={media.mediaSrc} key={_i} sx={direction==='row'?{width: 150, borderRadius: 1}:{width: '100%'}}/>:
                <div key={_i}/>
                // <Box component='video' src={media.mediaSrc}/>
              ))
            }
          </Box>
        </Stack>
        <svg width={0} height={0} style={{display: 'none'}}>
          <linearGradient id="linearColors" x1={0} y1={1} x2={1} y2={1}>
            <stop offset={0} stopColor="#7624FE" />
            <stop offset={1} stopColor="#368BFF" />
          </linearGradient>
        </svg>
        <Stack 
          direction="row" 
          spacing={2} 
          sx={{
            '& svg': {
              fill: 'url(#linearColors)',
              transition: 'transform .2s'
            },
            '& svg>path[stroke=currentColor]': {
              stroke: 'url(#linearColors)'
            },
            '& svg>path[fill=currentColor]': {
              fill: 'unset'
            },
            '& .MuiTypography-root.liked': {
              color: '#ff3333'
            }
          }}
        >
          <Stack direction="row" alignItems="center" spacing='2px' onClick={handleLike}>
            <Box sx={{position: 'relative', display: 'flex'}}>
              <Heart isLiked={isLike} isSaving={isSaving}/>
            </Box>
            <Typography 
              variant="body2" 
              className={isLike?"liked":""} 
              noWrap 
              sx={{
                display: 'flex',
                '& .odometer-digit-inner': {
                  display: 'flex',
                  alignItems: 'center'
                }
              }}
            >
              <Odometer value={(post.likes || 0)+(isLike as any&1)+(post.like_me?-1:0)} format='(,ddd).dd' />
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1} onClick={handleCommentDlg}>
            <Icon icon="clarity:chat-bubble-line" width={18}/>
            <Typography variant="body2" noWrap>{post.commentData?post.commentData.length:0}</Typography>
          </Stack>
          <Box flexGrow={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right'}}>
            {
              post.status===CommonStatus.edited &&
              <Typography variant="body2">(edited)</Typography>
            }
          </Box>
        </Stack>
      </Stack>
      {
        level==1 &&
        <StyledPopper
          anchorEl={anchorEl}
          open={isOpenPopover}
          disablePortal={false}
          onMouseEnter={(e)=>{setOpenPopover(true)}}
          onMouseLeave={(e)=>{handlePopper(e, false)}}
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
          ]}
          onClick={(e)=>{e.stopPropagation()}}
          sx={{zIndex: 100}}
          transition
        >
          {
            ({ TransitionProps }) => (
              <Fade {...TransitionProps}>
                <Paper sx={{p: 2}}>
                  <Stack direction="row">
                    <Box onClick={handleLink2Channel} sx={{cursor: 'pointer'}}>
                      <StyledAvatar alt={contentObj.avatar.name} src={contentObj.avatar.src} width={40}/>
                    </Box>
                    <Box sx={{flexGrow: 1}} textAlign="right">
                      <StyledButton type="contained">Subscribed</StyledButton>
                    </Box>
                  </Stack>
                  <Box>
                    <Typography component='div' variant="subtitle2" noWrap pt={1}>
                      <Link sx={{color:'inherit', cursor: 'pointer'}} onClick={handleLink2Channel}>
                        {contentObj.primaryName}
                      </Link>
                    </Typography>
                    <Typography component='div' variant="body2" noWrap>
                      <Link sx={{color:'inherit', cursor: 'pointer'}} onClick={handleLink2Profile}>
                        {contentObj.secondaryName}
                      </Link>
                    </Typography>
                    <Typography component='div' variant="body2" color="secondary">{currentChannel.intro}</Typography>
                  </Box>
                  <Divider sx={{my: 1}}/>
                  <Typography variant="body2" component='div' sx={{display: 'flex'}}>
                    <Icon icon="clarity:group-line" fontSize='20px' />&nbsp;
                    {subscribersOfThis.length} Subscribers
                  </Typography>
                  {
                    subscribersOfThis.length>0 &&
                    <Stack direction="row" mt={1} spacing={1}>
                      <AvatarGroup spacing={10}>
                        {
                          subscribersOfThis.slice(0, 3).map((subscriber, _i)=>{
                            const info_data = subscriberInfo[subscriber.user_did] || {}
                            return <StyledAvatar key={_i} alt={subscriber.display_name} src={info_data['avatar']} width={18}/>
                          })
                        }
                      </AvatarGroup>
                      <Typography variant="body2" flex={1}>{subscribedByWho}</Typography>
                    </Stack>
                  }
                </Paper>
              </Fade>
            )
          }
        </StyledPopper>
      }
      <CommentDlg setOpen={setOpenComment} isOpen={isOpenComment} post={post} postProps={{post, contentObj, isReply: true, level}}/>
      {
        isOwnedChannel?
        <>
          <PostDlg setOpen={setOpenPost} isOpen={isOpenPost} activePost={post}/>
          <DeletePostDlg setOpen={setOpenDelete} isOpen={isOpenDelete} post_id={post.post_id} channel_id={post.channel_id}/>
        </>:

        <UnsubscribeDlg setOpen={setOpenUnsubscribe} isOpen={isOpenUnsubscribe} target_did={currentChannel.target_did} channel_id={post.channel_id}/>
      }
    </>
  )
}

export default PostBody;
