import React from 'react'
import { Box, Stack, Typography, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';

import StyledAvatar from 'src/components/StyledAvatar'
import CommentDlg from 'src/components/Modal/Comment'
import { getDateDistance, isValidTime } from 'src/utils/common'

const PostBody = (props) => {
  const { post, contentObj, isReply=false } = props
  const distanceTime = isValidTime(post.created_at)?getDateDistance(post.created_at):''
  const [isOpenComment, setOpenComment] = React.useState(false)

  const handleCommentDlg = (e) => {
    e.stopPropagation()
    setOpenComment(true)
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
          {contentObj.content}
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
              fill: 'url(#linearColors)'
            },
            '& svg>path[stroke=currentColor]': {
              stroke: 'url(#linearColors)'
            },
            '& svg>path[fill=currentColor]': {
              fill: 'unset'
            }
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Icon icon="akar-icons:heart" width={18}/>
            <Typography variant="body2" noWrap>{post.likes || 0}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Icon icon="clarity:chat-bubble-line" width={18} onClick={handleCommentDlg}/>
            <Typography variant="body2" noWrap>{post.commentData?post.commentData.length:0}</Typography>
          </Stack>
        </Stack>
      </Stack>
      <CommentDlg setOpen={setOpenComment} isOpen={isOpenComment} post={post} postProps={{post, contentObj, isReply: true}}/>
    </>
  )
}

export default PostBody;
