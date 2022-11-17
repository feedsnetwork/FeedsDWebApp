import React from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Box, Stack, Typography } from '@mui/material';
import parse from 'html-react-parser';
import "odometer/themes/odometer-theme-default.css";

import StyledAvatar from 'components/StyledAvatar'
import PaperRecord from 'components/PaperRecord'
import { convertAutoLink, isJson, decodeBase64 } from 'utils/common'
import { getLocalDB } from 'utils/db';

const PostImgCard = (props) => {
  const { post } = props
  const [thisChannel, setThisChannel] = React.useState({})
  const LocalDB = getLocalDB()

  React.useEffect(()=>{
    LocalDB.get(post.channel_id)
      .then(doc=>{
        if(!doc['avatarSrc'].startsWith("http"))
          doc['avatarSrc'] = decodeBase64(doc['avatarSrc'])
        setThisChannel(doc)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // const [anchorEl, setAnchorEl] = React.useState(null);
  // const [isOpenPopover, setOpenPopover] = React.useState(false);
  // const [isEnterPopover, setEnterPopover] = React.useState(false);
  // const currentChannel = [...selfChannels, ...subscribedChannels].find(item=>item.channel_id==post.channel_id) || {}
  // const subscribersOfThis = currentChannel['subscribers'] || []
  // const subscribedByWho = `Subscribed by ${subscribersOfThis.slice(0,3).map(subscriber=>subscriber.display_name).join(', ')}${subscribersOfThis.length>3?' and more!':'.'}`

  let postContent = post.content
  if(isJson(postContent))
    postContent = JSON.parse(postContent)
  const filteredContentByLink = convertAutoLink(typeof postContent==='object'? postContent.content: postContent)
  // const background = 'url(/temp-img.png) no-repeat center'
  const background = post.mediaData? `url(${post.mediaData[0]['mediaSrc']}) no-repeat center`: null

  // const handlePopper = (e, open)=>{
  //   if(open)
  //     setAnchorEl(e.target)
  //   setOpenPopover(open)
  // }
  return (
    <PaperRecord sx={{display: 'flex', position: 'relative'}}>
      {
        !!background?
        <Box sx={{ width: '100%', height: '400px', background, backgroundSize: 'cover'}}/>:

        <Stack sx={{width: '100%', height: 400}}>
          <Skeleton baseColor='#333d48' highlightColor='#434d58' height={400} style={{lineHeight: 'unset'}}/>
        </Stack>
      }
      <Stack direction="row" alignItems="center" spacing={2} sx={{position: 'absolute', bottom: 0, p: 1, background: '#161c24c4', width: '100%', zIndex: 1, borderRadius: '0 0 16px 16px'}}>
        <Box
          // onMouseEnter={(e)=>{handlePopper(e, true)}}
          // onMouseLeave={(e)=>{handlePopper(e, false)}}
        >
          <StyledAvatar alt={thisChannel['name']} src={thisChannel['avatarSrc']} width={47}/>
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
    </PaperRecord>
  )
}

export default PostImgCard;
