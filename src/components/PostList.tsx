import { Box, Container, Grid } from '@mui/material';

import PostSkeleton from 'components/Skeleton/PostSkeleton'
import PostCard from 'components/PostCard';
import { EmptyView } from 'components/EmptyView'

const PostList = (props)=>{
  const { isLoading, channel, postsInActiveChannel, dispName } = props
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
                    <PostCard post={post} channel={channel} dispName={dispName}/>
                  </Grid>
                ))
              }
            </Grid>
          </Container>
        </Box>
      }
    </>
  )
}

export default PostList;
