import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Typography, Card, CardHeader, Divider, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Icon } from '@iconify/react';

import StyledAvatar from 'src/components/StyledAvatar'
import StyledButton from 'src/components/StyledButton'
import { SidebarContext } from 'src/contexts/SidebarContext';
import { getDateDistance, isValidTime } from 'src/utils/common'

const PostBody = (props) => {
  const { post, contentObj, isReply=false } = props
  const distanceTime = isValidTime(post.created_at)?getDateDistance(post.created_at):''

  return (
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
          <Icon icon="clarity:chat-bubble-line" width={18}/>
          <Typography variant="body2" noWrap>{post.commentData?post.commentData.length:0}</Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}
const PostCard = (props) => {
  const navigate = useNavigate();
  const { post, dispName, level=1, replyingTo='', dispNames={} } = props
  const { selfChannels, subscribedChannels } = React.useContext(SidebarContext);
  const currentChannel = [...selfChannels, ...subscribedChannels].find(item=>item.channel_id==post.channel_id) || {}
  
  const naviage2detail = (e) => {
    navigate(`/post/${post.post_id}`);
  }

  let contentObj = {avatar: {}, primaryName: '', secondaryName: null, content: ''}
  let cardProps = {}
  if(level == 1) {
    contentObj = JSON.parse(post.content)
    contentObj.avatar = { name: currentChannel.name, src: currentChannel.avatarSrc }
    contentObj.primaryName = currentChannel.name
    contentObj.secondaryName = `@${dispName}`
    cardProps = {style: {cursor: 'pointer'}, onClick: naviage2detail}
  } 
  else if(level == 2) {
    contentObj.avatar = { name: currentChannel.name, src: currentChannel.avatarSrc }
    contentObj.content = post.content
    contentObj.primaryName = `@${dispName}`
    contentObj.secondaryName = <><b>Replying to</b> @{replyingTo}</>
  }
  if(post.status == 1)
    contentObj.content = "(post deleted)"

  const BodyProps = { post, contentObj }
  return (
    <Card {...cardProps}>
      <Box p={3}>
        <PostBody {...BodyProps}/>
        <Stack px={3} pt={2} spacing={1}>
          {
            level==2 && post.commentData && 
            post.commentData.map((comment, _i)=>{
              let subContentObj = {
                avatar: {}, 
                primaryName: dispNames[comment.comment_id], 
                secondaryName: <><b>Replying to</b> @{dispName}</>, 
                content: comment.content
              }
              const subBodyProps = { post: comment, contentObj: subContentObj, isReply: true }
              return <PostBody {...subBodyProps} key={_i}/>
            })
          }
        </Stack>
      </Box>
    </Card>
  );
}

export default PostCard;
