import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Grid, Container, Box, Typography } from '@mui/material';

import PostList from 'src/components/PostList';
import { selectPublicChannels, selectDispNameOfChannels } from 'src/redux/slices/channel';
import { selectPublicPosts } from 'src/redux/slices/post';
import { reduceDIDstring, sortByDate } from 'src/utils/common'

function Channel() {
  const location = useLocation();
  const { channel_id } = (location.state || {}) as any
  const [isLoading, setIsLoading] = React.useState(false)
  const publicChannels = useSelector(selectPublicChannels)
  const publicPosts = useSelector(selectPublicPosts)
  const activeChannel = publicChannels[channel_id] || {}
  const postsInActiveChannel = sortByDate(publicPosts[channel_id] || [])
  const dispNameOfChannels = useSelector(selectDispNameOfChannels)

  React.useEffect(()=>{
    if(channel_id) {
      if(!publicPosts[channel_id])
        setIsLoading(true)
      else
        setIsLoading(false)
    }
  }, [publicPosts])

  const postListProps = { isLoading, postsInActiveChannel, dispName: dispNameOfChannels[channel_id] || reduceDIDstring(activeChannel.target_did) }
  return (
    <PostList {...postListProps}/>
  );
}

export default Channel;
