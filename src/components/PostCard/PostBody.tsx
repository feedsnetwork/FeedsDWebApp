import React from 'react'
import { Box, Stack, Typography, IconButton, styled } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';
import Autolinker from 'autolinker';
import parse from 'html-react-parser';
import Odometer from "react-odometerjs";
import "odometer/themes/odometer-theme-default.css";

import StyledAvatar from 'src/components/StyledAvatar'
import CommentDlg from 'src/components/Modal/Comment'
import { SidebarContext } from 'src/contexts/SidebarContext';
import Heart from 'src/components/Heart'
import { getDateDistance, isValidTime, hash } from 'src/utils/common'
import { HiveApi } from 'src/services/HiveApi'

const PostBody = (props) => {
  const { post, contentObj, isReply=false } = props
  const distanceTime = isValidTime(post.created_at)?getDateDistance(post.created_at):''
  const { selfChannels, subscribedChannels } = React.useContext(SidebarContext);
  const [isLike, setIsLike] = React.useState(!!post.like_me)
  const [isOpenComment, setOpenComment] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const hiveApi = new HiveApi()
  const currentChannel = [...selfChannels, ...subscribedChannels].find(item=>item.channel_id==post.channel_id) || {}
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const userDid = `did:elastos:${feedsDid}`
  const { enqueueSnackbar } = useSnackbar();
  var autolinker = new Autolinker( {
    urls : {
        schemeMatches : true,
        tldMatches    : true,
        ipV4Matches   : true,
    },
    email       : true,
    phone       : true,
    mention     : 'twitter',
    hashtag     : 'twitter',

    stripPrefix : true,
    stripTrailingSlash : true,
    newWindow   : true,

    truncate : {
        length   : 0,
        location : 'end'
    },

    className : 'outer-link'
} );

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

  let tempContent = contentObj.content
  let filteredContentByLink = autolinker.link(tempContent);
  let splitByHttp = filteredContentByLink.split('http')
  splitByHttp = splitByHttp.slice(0, splitByHttp.length-1)
  const brokenLinkStrings = splitByHttp.filter(el=>el.charAt(el.length-1)!='"')
  if(brokenLinkStrings.length){
    brokenLinkStrings.forEach(str=>{
      const lastChar = str.charAt(str.length-1)
      tempContent = tempContent.replace(`${lastChar}http`, `${lastChar} http`)
    })
    filteredContentByLink = autolinker.link(tempContent);
  }

  return (
    <>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <StyledAvatar alt={contentObj.avatar.name} src={contentObj.avatar.src} width={isReply?40:47}/>
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
        <Typography variant="body2" sx={{whiteSpace: 'pre-line'}}>
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
      <CommentDlg setOpen={setOpenComment} isOpen={isOpenComment} post={post} postProps={{post, contentObj, isReply: true}}/>
    </>
  )
}

export default PostBody;
