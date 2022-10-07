import React from 'react'
import { useSelector } from 'react-redux'
import { Box, Stack, Typography } from '@mui/material';
import parse from 'html-react-parser';
import "odometer/themes/odometer-theme-default.css";

import StyledAvatar from 'src/components/StyledAvatar'
import PaperRecord from 'src/components/PaperRecord'
import { SidebarContext } from 'src/contexts/SidebarContext';
import { selectPublicChannels } from 'src/redux/slices/channel';
import { getDateDistance, isValidTime, hash, convertAutoLink } from 'src/utils/common'

const PostImgCard = (props) => {
  const { post, contentObj, level=1 } = props
  // const { selfChannels, subscribedChannels, subscriberInfo } = React.useContext(SidebarContext);
  // const [anchorEl, setAnchorEl] = React.useState(null);
  // const [isOpenPopover, setOpenPopover] = React.useState(false);
  // const [isEnterPopover, setEnterPopover] = React.useState(false);
  // const currentChannel = [...selfChannels, ...subscribedChannels].find(item=>item.channel_id==post.channel_id) || {}
  // const subscribersOfThis = currentChannel['subscribers'] || []
  // const subscribedByWho = `Subscribed by ${subscribersOfThis.slice(0,3).map(subscriber=>subscriber.display_name).join(', ')}${subscribersOfThis.length>3?' and more!':'.'}`

  const publicChannels = useSelector(selectPublicChannels)
  const channelOfPost = publicChannels[post.channel_id] || {}
  const filteredContentByLink = convertAutoLink(typeof post.content==='object'? post.content.content: post.content)
  const background = 'url(/temp-img.png) no-repeat center'

  // const handlePopper = (e, open)=>{
  //   if(open)
  //     setAnchorEl(e.target)
  //   setOpenPopover(open)
  // }

  return (
    <PaperRecord sx={{display: 'flex'}}>
      <Box sx={{ width: '100%', height: '400px', background, backgroundSize: 'cover', position: 'relative'}}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{position: 'absolute', bottom: 0, p: 1, background: '#161c24c4'}}>
          <Box
            // onMouseEnter={(e)=>{handlePopper(e, true)}}
            // onMouseLeave={(e)=>{handlePopper(e, false)}}
          >
            <StyledAvatar alt={channelOfPost.name} src={channelOfPost.data.avatarUrl} width={47}/>
          </Box>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography 
              variant="body2" 
              sx={{
                whiteSpace: 'pre-line', 
                '& a.outer-link': {
                  color: '#368BFF', 
                  textDecoration: 'none'
                },
                lineHeight: 1.3,
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                display: '-webkit-box !important'
              }}
            >
              {parse(filteredContentByLink)}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </PaperRecord>
  )
}

export default PostImgCard;
