import React from 'react'
import { Box, Stack, Typography, IconButton, Popper, Paper, styled, Divider, AvatarGroup, Fade } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
import parse from 'html-react-parser';
import Odometer from "react-odometerjs";
import "odometer/themes/odometer-theme-default.css";

import StyledAvatar from 'src/components/StyledAvatar'
import CommentDlg from 'src/components/Modal/Comment'
import StyledButton from 'src/components/StyledButton'
import { SidebarContext } from 'src/contexts/SidebarContext';
import Heart from 'src/components/Heart'
import { getDateDistance, isValidTime, hash, convertAutoLink } from 'src/utils/common'
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

const PostBody = (props) => {
  const { post, contentObj, isReply=false, level=1 } = props
  const distanceTime = isValidTime(post.created_at)?getDateDistance(post.created_at):''
  const { selfChannels, subscribedChannels, subscriberInfo } = React.useContext(SidebarContext);
  const [isLike, setIsLike] = React.useState(!!post.like_me)
  const [isOpenComment, setOpenComment] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isOpenPopover, setOpenPopover] = React.useState(false);
  const [isEnterPopover, setEnterPopover] = React.useState(false);
  const hiveApi = new HiveApi()
  const currentChannel = [...selfChannels, ...subscribedChannels].find(item=>item.channel_id==post.channel_id) || {}
  const subscribersOfThis = currentChannel['subscribers'] || []
  const subscribedByWho = `Subscribed by ${subscribersOfThis.slice(0,3).map(subscriber=>subscriber.display_name).join(', ')}${subscribersOfThis.length>3?' and more!':'.'}`
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const userDid = `did:elastos:${feedsDid}`
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(()=>{
    setIsLike(!!post.like_me)
  }, [post.like_me])

  const handleCommentDlg = (e) => {
    e.stopPropagation()
    setOpenComment(true)
  }

  const handleLike = async (e) => {
    e.stopPropagation()
    if(isSaving)
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

  return (
    <>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            onMouseEnter={(e)=>{handlePopper(e, true)}}
            onMouseLeave={(e)=>{handlePopper(e, false)}}
          >
            <StyledAvatar alt={contentObj.avatar.name} src={contentObj.avatar.src} width={isReply?40:47}/>
          </Box>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography component='div' variant="subtitle2" noWrap>
              {contentObj.primaryName}{' '}<Typography variant="body2" color="text.secondary" sx={{display: 'inline'}}>{distanceTime}</Typography>
            </Typography>
            <Typography variant="body2" noWrap>
              {contentObj.secondaryName}
            </Typography>
          </Box>
          {
            !isReply &&
            <Box>
              <IconButton aria-label="settings" size='small'>
                <MoreVertIcon />
              </IconButton>
            </Box>
          }
        </Stack>
        <Typography 
          variant="body2" 
          onClick={handleClickInContent}
          sx={{
            whiteSpace: 'pre-line', 
            '& a.outer-link': {
              color: '#368BFF', 
              textDecoration: 'none'
            }
          }}
        >
          {parse(filteredContentByLink)}
        </Typography>
        {
          !!post.mediaData && post.mediaData.map((media, _i)=>(
            media.kind == 'image'?
            <Box component='img' src={media.mediaSrc} key={_i}/>:
            <div key={_i}/>
            // <Box component='video' src={media.mediaSrc}/>
          ))
        }
        <svg width={0} height={0}>
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
        </Stack>
      </Stack>
      <CommentDlg setOpen={setOpenComment} isOpen={isOpenComment} post={post} postProps={{post, contentObj, isReply: true, level}}/>
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
                    <StyledAvatar alt={contentObj.avatar.name} src={contentObj.avatar.src} width={40}/>
                    <Box sx={{flexGrow: 1}} textAlign="right">
                      <StyledButton type="contained">Subscribed</StyledButton>
                    </Box>
                  </Stack>
                  <Box>
                    <Typography component='div' variant="subtitle2" noWrap pt={1}>{contentObj.primaryName}</Typography>
                    <Typography component='div' variant="body2" noWrap>{contentObj.secondaryName}</Typography>
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
                          subscribersOfThis.slice(0, 3).map(subscriber=>{
                            const info_data = subscriberInfo[subscriber.user_did] || {}
                            return <StyledAvatar alt={subscriber.display_name} src={info_data['avatar']} width={18}/>
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
    </>
  )
}

export default PostBody;
