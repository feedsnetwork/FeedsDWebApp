import React from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom';

import PostList from 'components/PostList';
import { selectPublicChannels, selectDispNameOfChannels } from 'redux/slices/channel';
import { selectPublicPosts } from 'redux/slices/post';
import { reduceDIDstring, sortByDate } from 'utils/common'

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
  }, [publicPosts, channel_id])

  const postListProps = { isLoading, postsInActiveChannel, dispName: dispNameOfChannels[channel_id] || reduceDIDstring(activeChannel.target_did) }
  return (
    <PostList {...postListProps}/>
  );
}

export default Channel;
