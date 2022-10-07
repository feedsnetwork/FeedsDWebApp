import React from 'react'
import { useSelector } from 'react-redux'
import { Box, Stack, Typography } from '@mui/material';
import parse from 'html-react-parser';
import "odometer/themes/odometer-theme-default.css";

import StyledAvatar from 'src/components/StyledAvatar'
import PaperRecord from 'src/components/PaperRecord'
import { SidebarContext } from 'src/contexts/SidebarContext';
import { selectPublicChannels, selectDispNameOfChannels } from 'src/redux/slices/channel';
import { getDateDistance, isValidTime, hash, convertAutoLink } from 'src/utils/common'

const PostTextCard = (props) => {
  const { post, contentObj, level=1 } = props
  const distanceTime = isValidTime(post.created_at)?getDateDistance(post.created_at):''
  const { selfChannels, subscribedChannels, subscriberInfo } = React.useContext(SidebarContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isOpenPopover, setOpenPopover] = React.useState(false);
  const [isEnterPopover, setEnterPopover] = React.useState(false);
  const currentChannel = [...selfChannels, ...subscribedChannels].find(item=>item.channel_id==post.channel_id) || {}
  const subscribersOfThis = currentChannel['subscribers'] || []
  const subscribedByWho = `Subscribed by ${subscribersOfThis.slice(0,3).map(subscriber=>subscriber.display_name).join(', ')}${subscribersOfThis.length>3?' and more!':'.'}`

  const publicChannels = useSelector(selectPublicChannels)
  const dispNameOfChannels = useSelector(selectDispNameOfChannels)
  const channelOfPost = publicChannels[post.channel_id] || {}
  const filteredContentByLink = convertAutoLink(typeof post.content==='object'? post.content.content: post.content)
  
  const handlePopper = (e, open)=>{
    if(open)
      setAnchorEl(e.target)
    setOpenPopover(open)
  }

  return (
    <PaperRecord sx={{p: 2}}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            // onMouseEnter={(e)=>{handlePopper(e, true)}}
            // onMouseLeave={(e)=>{handlePopper(e, false)}}
          >
            <StyledAvatar alt={channelOfPost.name} src={channelOfPost.data.avatarUrl} width={47}/>
          </Box>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography component='div' variant="subtitle2" noWrap>
              {channelOfPost.name}{' '}<Typography variant="body2" color="text.secondary" sx={{display: 'inline'}}>{distanceTime}</Typography>
            </Typography>
            <Typography variant="body2" noWrap>
              {dispNameOfChannels[post.channel_id] || ''}
            </Typography>
          </Box>
        </Stack>
        <Typography 
          variant="body2" 
          sx={{
            whiteSpace: 'pre-line', 
            '& a.outer-link': {
              color: '#368BFF', 
              textDecoration: 'none'
            },
            lineHeight: 1.3,
            WebkitLineClamp: 7,
            WebkitBoxOrient: 'vertical',
            // whiteSpace: 'normal',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            display: '-webkit-box !important'
          }}
        >
          {parse(filteredContentByLink)}
        </Typography>
      </Stack>
    </PaperRecord>
  )
}

export default PostTextCard;
