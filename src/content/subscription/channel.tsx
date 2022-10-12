import React from 'react'
import { useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Grid, Container, Box, Typography } from '@mui/material';

import PostList from 'components/PostList';
import { SidebarContext } from 'contexts/SidebarContext';
import { reduceDIDstring, sortByDate } from 'utils/common'

function Channel() {
  const location = useLocation();
  const { channel_id } = (location.state || {}) as any
  const { subscribedChannels, postsInSubs } = React.useContext(SidebarContext);
  const [isLoading, setIsLoading] = React.useState(false)
  const activeChannel = subscribedChannels.find(item=>item.channel_id==channel_id) || {}
  const postsInActiveChannel = sortByDate(postsInSubs[channel_id] || [])
  
  React.useEffect(()=>{
    if(channel_id) {
      if(!postsInSubs[channel_id])
        setIsLoading(true)
      else
        setIsLoading(false)
    }
  }, [postsInSubs])

  const postListProps = { isLoading, postsInActiveChannel, dispName: activeChannel.owner_name || reduceDIDstring(activeChannel.target_did) }
  return (
    <PostList {...postListProps}/>
  );
}

export default Channel;
