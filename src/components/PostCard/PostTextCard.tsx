import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router';
import { Box, Stack, Typography } from '@mui/material';
import parse from 'html-react-parser';
import "odometer/themes/odometer-theme-default.css";

import PaperRecord from 'components/PaperRecord'
import ChannelName from 'components/ChannelName';
import NoRingAvatar from 'components/NoRingAvatar';
import { selectChannelById } from 'redux/slices/channel';
import { getDateDistance, isValidTime, convertAutoLink, isJson, getImageSource } from 'utils/common'
const PostTextCard = (props) => {
  const { post } = props
  const distanceTime = isValidTime(post.created_at)? getDateDistance(post.created_at): ''
  const navigate = useNavigate();

  // const [anchorEl, setAnchorEl] = React.useState(null);
  // const [isOpenPopover, setOpenPopover] = React.useState(false);
  // const [isEnterPopover, setEnterPopover] = React.useState(false);
  // const currentChannel = [...selfChannels, ...subscribedChannels].find(item=>item.channel_id==post.channel_id) || {}
  // const subscribersOfThis = currentChannel['subscribers'] || []
  // const subscribedByWho = `Subscribed by ${subscribersOfThis.slice(0,3).map(subscriber=>subscriber.display_name).join(', ')}${subscribersOfThis.length>3?' and more!':'.'}`

  const thisChannel = useSelector(selectChannelById(post.channel_id)) || {}
  let postContent = post.content
  if(isJson(postContent))
    postContent = JSON.parse(postContent)
  const filteredContentByLink = convertAutoLink(typeof postContent==='object'? postContent.content: postContent)
  
  // const handlePopper = (e, open)=>{
  //   if(open)
  //     setAnchorEl(e.target)
  //   setOpenPopover(open)
  // }
  const naviage2detail = (e) => {
    navigate(`/post/${post.post_id}`);
  }

  return (
    <PaperRecord sx={{p: 2, cursor: 'pointer'}} onClick={naviage2detail}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            // onMouseEnter={(e)=>{handlePopper(e, true)}}
            // onMouseLeave={(e)=>{handlePopper(e, false)}}
          >
            <NoRingAvatar alt={thisChannel['display_name']} src={getImageSource(thisChannel['avatarSrc'])} width={47}/>
          </Box>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <ChannelName name={thisChannel['display_name']} isPublic={thisChannel['is_public']} variant="subtitle2"/>
            <Typography variant="body2" color="text.secondary" sx={{display: 'inline'}}>{distanceTime}</Typography>
            <Typography variant="body2" noWrap>
              @{thisChannel['owner_name'] || ''}
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
            WebkitLineClamp: 5,
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
