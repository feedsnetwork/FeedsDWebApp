import React from 'react'
import { Grid, Container, Box, Typography, Stack } from '@mui/material';

import PostCard from 'components/PostCard';
import { EmptyView } from 'components/EmptyView'
import PostSkeleton from 'components/Skeleton/PostSkeleton'
import { SidebarContext } from 'contexts/SidebarContext';
import { reduceDIDstring, sortByDate, getMergedArray } from 'utils/common'

const Home = () => {
  const { postsInSubs, subscribedChannels } = React.useContext(SidebarContext);
  const [isLoading, setIsLoading] = React.useState(false)
  const postsInHome = sortByDate(getMergedArray(postsInSubs))

  React.useEffect(()=>{
    if(subscribedChannels.length>0 && !Object.keys(postsInSubs).length)
      setIsLoading(true)
    else
      setIsLoading(false)
  }, [postsInSubs, subscribedChannels])
  
  const loadingSkeletons = Array(5).fill(null)

  return (
    <>
      {
        !isLoading && !postsInHome.length?
        <EmptyView/>:

        <Container sx={{ my: 3 }} maxWidth="lg">
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

              postsInHome.slice(0, 5).map((post, _i)=>{
                const channelOfPost = subscribedChannels.find(item=>item.channel_id==post.channel_id) || {}
                return <Grid item xs={12} key={_i}>
                  <PostCard post={post} dispName={channelOfPost['owner_name'] || reduceDIDstring(post.target_did)}/>
                </Grid>
              })
            }
          </Grid>
        </Container>
      }
    </>
  );
}

export default Home;
