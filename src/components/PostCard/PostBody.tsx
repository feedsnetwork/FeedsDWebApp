import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { Box, Stack, Typography, IconButton, Menu, MenuItem, Link } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
import parse from 'html-react-parser';
import Odometer from "react-odometerjs";
import "odometer/themes/odometer-theme-default.css";

import IconInCircle from 'components/IconInCircle'
import Heart from 'components/Heart'
import ChannelName from 'components/ChannelName';
import ChannelAvatarWithPopper from './ChannelAvatarWithPopper';
import PostMedia from './PostMedia';
import { SidebarContext } from 'contexts/SidebarContext';
import { CommonStatus } from 'models/common_content'
import { HiveApi } from 'services/HiveApi'
import { handleUnsubscribeModal, selectChannelById, setActiveChannelId, setFocusedChannelId, setTargetChannel, setVisitedChannelId } from 'redux/slices/channel';
import { handleCommentModal, handleDelPostModal, handlePostModal, selectActivePost, setActivePost, setActivePostProps } from 'redux/slices/post';
import { getDateDistance, isValidTime, hash, convertAutoLink, getPostShortUrl, copy2clipboard, filterSelfComment, getShortDIDstring } from 'utils/common'
import { getLocalDB } from 'utils/db';
import { selectQueryStep } from 'redux/slices/proc';

const PostBody = (props) => {
  const { post, contentObj, isReply=false, level=1, direction='column' } = props
  const distanceTime = isValidTime(post.created_at)?getDateDistance(post.created_at):''
  const activePost = useSelector(selectActivePost)
  const { publishPostNumber } = React.useContext(SidebarContext);
  const [isLike, setIsLike] = React.useState(!!post.like_me)
  const currentChannel = useSelector(selectChannelById(post.channel_id)) || {}
  const [commentCount, setCommentCount] = React.useState(0)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isOpenPopup, setOpenPopup] = React.useState(null);
  const currentCommentStep = useSelector(selectQueryStep('comment_data'))
  const hiveApi = new HiveApi()
  const PostOrComment = !post.comment_id?'Post':'Comment'
  const feedsDid = localStorage.getItem('FEEDS_DID')
  const myDID = `did:elastos:${feedsDid}`
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const LocalDB = getLocalDB()
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(()=>{
    if(currentCommentStep)
      getCommentCount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCommentStep, post])

  React.useEffect(()=>{
    if(publishPostNumber && activePost && activePost['post_id'] === post.post_id)
      getCommentCount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publishPostNumber])

  React.useEffect(()=>{
    setIsLike(!!post.like_me)
  }, [post.like_me])

  const getCommentCount = ()=>{
    const selector = { table_type: 'comment' as any, post_id: post.post_id }
    if(level === 1) {
      selector['table_type'] = {$in: ['comment', 'post']}
      selector['$or'] = [
        {
          refcomment_id: {$exists: false}
        },
        {
          refcomment_id: '0'
        }
      ]
    }
    if(level === 2)
      selector['refcomment_id'] = post.comment_id
    LocalDB.find({ selector })
      .then(res => {
        let filteredDocs = filterSelfComment(res.docs)
        setCommentCount(filteredDocs.length)
      })
  }
  const handleCommentDlg = (e) => {
    e.stopPropagation()
    if(post.status !== CommonStatus.deleted) {
      dispatch(setActivePost(post))
      dispatch(setActivePostProps({contentObj, isReply: true, level}))
      handleCommentModal(true)(dispatch)
    }
  }

  const handleLike = async (e) => {
    e.stopPropagation()
    if(isSaving || post.status === CommonStatus.deleted)
      return
    setIsSaving(true)
    let hiveAction = null
    if(!isLike) {
      const likeId = hash(`${post.post_id}${post.comment_id || 0}${myDID}`)
      hiveAction = hiveApi.addLike(post.target_did, likeId, post.channel_id, post.post_id, post.comment_id || '0')
    } else {
      hiveAction = hiveApi.removeLike(post.target_did, post.channel_id, post.post_id, post.comment_id || '0')
    }
    Promise.resolve()
      .then(_=>hiveAction)
      .then(_=>LocalDB.get(post.post_id))
      .then(doc=>{
        const tempDoc = {...doc}
        if(!isLike) {
          tempDoc['likes'] += 1
          tempDoc['like_me'] = true
          tempDoc['like_creators'].push(myDID)
        } else {
          const myDIDindex = tempDoc['like_creators'].indexOf(myDID)
          tempDoc['likes'] -= 1
          tempDoc['like_me'] = false
          if(myDIDindex>=0)
            tempDoc['like_creators'].splice(myDIDindex, 1)
        }
        return LocalDB.put(tempDoc)
      })
      .then(_=>{
        setIsLike(!isLike)
        setIsSaving(false)
      })
      .catch(err=>{
        setIsSaving(false)
        enqueueSnackbar('Like action error', { variant: 'error' });
      })
  }

  const filteredContentByLink = convertAutoLink(contentObj.content)
  const handleClickInContent = (e)=>{
    if(e.target.className.includes('outer-link'))
      e.stopPropagation()
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
        dispatch(setActivePost(post))
        dispatch(setActiveChannelId(0))
        handlePostModal(true)(dispatch)
        break;
      case 'delete':
        if(!currentChannel['is_self']) {
          return
        }
        dispatch(setActivePost(post))
        handleDelPostModal(true)(dispatch)
        break;
      case 'unsubscribe':
        if(currentChannel['is_self']) {
          return
        }
        dispatch(setTargetChannel(currentChannel))
        handleUnsubscribeModal(true)(dispatch)
        break;
      default:
        break;
    }
    setOpenPopup(null);
  };
  const handleLink2Channel = (e)=>{
    e.stopPropagation()
    if(currentChannel['is_self']) {
      dispatch(setFocusedChannelId(post.channel_id))
      navigate('/channel')
    } else {
      dispatch(setVisitedChannelId(post.channel_id))
      navigate('/subscription/channel');
    }
  }
  const handleLink2Profile = (e)=>{
    e.stopPropagation()
    const isSelf = post.target_did === feedsDid
    if(isSelf) {
      navigate('/profile')
    } else {
      navigate(`/profile/others/${getShortDIDstring(post.target_did)}`);
    }
  }
  const channelAvatarProps = {contentObj, isReply, level, channel_id: post.channel_id, handleLink2Channel, handleLink2Profile}
  return (
    <>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <ChannelAvatarWithPopper {...channelAvatarProps} />
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography component='div' variant="subtitle2" noWrap>
              {
                level===1?
                <Link sx={{color:'inherit'}} onClick={handleLink2Channel}>
                  <ChannelName name={contentObj.primaryName} isPublic={currentChannel['is_public']} variant="div" sx={{display: 'inline-flex'}}/>
                </Link>:

                contentObj.primaryName
              }
              {' '}<Typography variant="body2" color="text.secondary" sx={{display: 'inline'}}>{distanceTime}</Typography>
            </Typography>
            <Typography variant="body2" noWrap>
              {
                level===1?
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
                  currentChannel['is_self']?
                  <div>
                    <MenuItem value='share' onClick={handleClosePopup}>
                      <IconInCircle name='clarity:share-line'/>&nbsp;
                      <Typography variant="subtitle2">Copy Link to Share</Typography>
                    </MenuItem>
                    <MenuItem value='edit' onClick={handleClosePopup}>
                      <IconInCircle name='clarity:note-edit-line'/>&nbsp;
                      <Typography variant="subtitle2">Edit {PostOrComment}</Typography>
                    </MenuItem>
                    <MenuItem value='delete' onClick={handleClosePopup}>
                      <IconInCircle name='fa6-solid:trash-can' stress={true}/>&nbsp;
                      <Typography variant="subtitle2" color="#FF453A">Delete {PostOrComment}</Typography>
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
        <Stack direction={direction}>
          <Typography 
            variant="body2" 
            onClick={handleClickInContent}
            sx={{
              flexGrow: 1,
              whiteSpace: 'pre-line', 
              overflowWrap: 'anywhere',
              '& a.outer-link': {
                color: '#368BFF', 
                textDecoration: 'none'
              }
            }}
          >
            {parse(filteredContentByLink)}
          </Typography>
          {
            level === 1 &&
            <PostMedia postId={post.post_id} direction={direction}/>
          }
        </Stack>
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
            <Typography variant="body2" noWrap>{commentCount}</Typography>
          </Stack>
          <Box flexGrow={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right'}}>
            {
              post.status===CommonStatus.edited &&
              <Typography variant="body2">(edited)</Typography>
            }
          </Box>
        </Stack>
      </Stack>
    </>
  )
}
export default PostBody;