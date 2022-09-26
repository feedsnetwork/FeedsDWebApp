import React from 'react'
import { Box, Stack, Typography } from '@mui/material';
import parse from 'html-react-parser';
import "odometer/themes/odometer-theme-default.css";

import StyledAvatar from 'src/components/StyledAvatar'
import PaperRecord from 'src/components/PaperRecord'
import { SidebarContext } from 'src/contexts/SidebarContext';
import { getDateDistance, isValidTime, hash, convertAutoLink } from 'src/utils/common'

const PostTextCard = (props) => {
  const { post, contentObj, isReply=false, level=1 } = props
  const distanceTime = isValidTime(post.created_at)?getDateDistance(post.created_at):''
  const { selfChannels, subscribedChannels, subscriberInfo } = React.useContext(SidebarContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isOpenPopover, setOpenPopover] = React.useState(false);
  const [isEnterPopover, setEnterPopover] = React.useState(false);
  const currentChannel = [...selfChannels, ...subscribedChannels].find(item=>item.channel_id==post.channel_id) || {}
  const subscribersOfThis = currentChannel['subscribers'] || []
  const subscribedByWho = `Subscribed by ${subscribersOfThis.slice(0,3).map(subscriber=>subscriber.display_name).join(', ')}${subscribersOfThis.length>3?' and more!':'.'}`

  const filteredContentByLink = convertAutoLink(contentObj.content)
  
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
