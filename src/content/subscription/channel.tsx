import React from 'react'
import { useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Grid, Container, Box, Typography } from '@mui/material';

import PostCard from 'src/components/PostCard';
import { SidebarContext } from 'src/contexts/SidebarContext';
import PostSkeleton from 'src/components/Skeleton/PostSkeleton'
import { EmptyView } from 'src/components/EmptyView'
import { reduceDIDstring, sortByDate } from 'src/utils/common'

function Channel() {
  const location = useLocation();
  const { channel_id } = (location.state || {}) as any
  const { subscribedChannels, postsInSubs } = React.useContext(SidebarContext);
  const [isLoading, setIsLoading] = React.useState(false)
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const activeChannel = subscribedChannels.find(item=>item.channel_id==channel_id) || {}
  const postsInActiveChannel = sortByDate(postsInSubs[channel_id] || [])
  const dispName = activeChannel.owner_name
  
  React.useEffect(()=>{
    if(channel_id) {
      if(!postsInSubs[channel_id])
        setIsLoading(true)
      else
        setIsLoading(false)
    }
  }, [postsInSubs])

  const loadingSkeletons = Array(5).fill(null)
  return (
    <>
      {
        !isLoading && !postsInActiveChannel.length?
        <EmptyView type='post'/>:

        <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
          <Container sx={{ mt: 3, flexGrow: 1, overFlow: 'auto' }} maxWidth="lg">
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="stretch"
              spacing={3}
            >
              {
                isLoading?
                loadingSkeletons.map((_, _i)=>(
                  <Grid item xs={12} key={_i}>
                    <PostSkeleton/>
                  </Grid>
                )):

                postsInActiveChannel.map((post, _i)=>(
                  <Grid item xs={12} key={_i}>
                    <PostCard post={post} dispName={dispName || reduceDIDstring(feedsDid)}/>
                  </Grid>
                ))
              }
            </Grid>
          </Container>
        </Box>
      }
    </>
  );
}

export default Channel;
