import React from 'react'
import { Grid, Container, Box, Typography, Stack } from '@mui/material';

import PostCard from 'components/PostCard';
import { EmptyView } from 'components/EmptyView'
import PostSkeleton from 'components/Skeleton/PostSkeleton'
import { SidebarContext } from 'contexts/SidebarContext';
import { reduceDIDstring, sortByDate, getMergedArray } from 'utils/common'
import { LocalDB, QueryStep } from 'utils/db';

const Home = () => {
  const { queryStep } = React.useContext(SidebarContext);
  const [channels, setChannels] = React.useState([])
  const [posts, setPosts] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(false)
  const postsInHome = sortByDate(posts)

  React.useEffect(()=>{
    if(queryStep < QueryStep.post_data) {
      setIsLoading(true)
    }
    else {
      LocalDB.find({
        selector: {
          table_type: 'post'
        }
      })
        .then(response => {
          setPosts(response.docs)
        })
    }
    if(queryStep && !setChannels.length) {
      LocalDB.find({
        selector: {
          table_type: 'channel'
        }
      })
        .then(response => {
          setChannels(response.docs)
        })
    }
  }, [queryStep])
  
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
                const channelOfPost = channels.find(item=>item.channel_id === post.channel_id) || {}
                return (
                  <Grid item xs={12} key={_i}>
                    <PostCard post={post} channel={channelOfPost} dispName={channelOfPost['owner_name'] || reduceDIDstring(post.target_did)}/>
                  </Grid>
                )
              })
            }
          </Grid>
        </Container>
      }
    </>
  );
}

export default Home;
