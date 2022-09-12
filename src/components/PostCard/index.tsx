import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Typography, Card, CardHeader, Divider, lighten, CardActionArea, CardContent, Tooltip, IconButton, Avatar, styled } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Icon } from '@iconify/react';

import StyledAvatar from 'src/components/StyledAvatar'
import StyledButton from 'src/components/StyledButton'
import { SidebarContext } from 'src/contexts/SidebarContext';
import { getDateDistance, isValidTime } from 'src/utils/common'

const PostCard = (props) => {
  const navigate = useNavigate();
  const { post, dispName, level=1 } = props
  const { selfChannels, subscribedChannels } = React.useContext(SidebarContext);
  const currentChannel = [...selfChannels, ...subscribedChannels].find(item=>item.channel_id==post.channel_id) || {}
  
  const naviage2detail = (e) => {
    navigate(`/post/${post.post_id}`);
  }

  let postObj = {content: ''}
  let distanceTime = ''
  let cardProps = {}
  if(level==1) {
    postObj = JSON.parse(post.content)
    if(post.status == 1)
      postObj.content = "(post deleted)"
    distanceTime = isValidTime(post.created)?getDateDistance(post.created):''
    cardProps = {style: {cursor: 'pointer'}, onClick: naviage2detail}
  } 
  else if(level == 2) {
    postObj.content = post.content
    distanceTime = isValidTime(post.created_at/1000)?getDateDistance(post.created_at/1000):''
  }


  return (
    <Card {...cardProps}>
      <Box p={3}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <StyledAvatar alt={currentChannel.name} src={currentChannel.avatarSrc}/>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography component='div' variant="subtitle2" noWrap>
                {currentChannel.name}{' '}<Typography variant="body2" color="text.secondary" sx={{display: 'inline'}}>{distanceTime}</Typography>
              </Typography>
              <Typography variant="body2" noWrap>
                @{dispName}
              </Typography>
            </Box>
            <Box>
              <IconButton aria-label="settings" size='small'>
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Stack>
          <Typography variant="body2" sx={{whiteSpace: 'pre-line'}}>
            {postObj.content}
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
      </Box>
    </Card>
  );
}

export default PostCard;
