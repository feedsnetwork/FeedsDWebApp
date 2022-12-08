import { Box, Container, Grid } from '@mui/material';
import InfiniteScroll from "react-infinite-scroll-component";

import PostSkeleton from 'components/Skeleton/PostSkeleton'
import PostCard from 'components/PostCard';
import { EmptyView } from 'components/EmptyView'

const PostList = (props)=>{
  const { isLoading, posts, appendMoreData, hasMore } = props
  const loadingSkeletons = Array(5).fill(null)
  return (
    <>
      {
        !isLoading && !posts.length?
        <EmptyView type='post'/>:

        <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
          <Container sx={{ mt: 3, flexGrow: 1, overFlow: 'auto', px: { xs: 3, sm: 6} }} maxWidth="lg">
            <InfiniteScroll
              dataLength={posts.length}
              next={()=>{appendMoreData('next')}}
              hasMore={hasMore}
              loader={<h4>Loading...</h4>}
              scrollableTarget="scrollableBox"
              style={{overflow: 'visible'}}
            >
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

                  posts.map((post, _i)=>(
                    <Grid item xs={12} key={_i}>
                      <PostCard post={post}/>
                    </Grid>
                  ))
                }
              </Grid>
            </InfiniteScroll>
          </Container>
        </Box>
      }
    </>
  )
}

export default PostList;
