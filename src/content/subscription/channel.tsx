import React from 'react'
import { useSelector } from 'react-redux';
import InfiniteScroll from "react-infinite-scroll-component";
import { Box, Container, Grid } from '@mui/material';

import PostSkeleton from 'components/Skeleton/PostSkeleton'
import PostCard from 'components/PostCard';
import { EmptyView } from 'components/EmptyView'
import { getLocalDB } from 'utils/db'
import { selectIsLoadedPost, selectVisitedChannelId } from 'redux/slices/channel'

function Channel() {
  const channel_id = useSelector(selectVisitedChannelId)
  const isLoadedPost = useSelector(selectIsLoadedPost(channel_id))
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasMore, setHasMore] = React.useState(true)
  const [pageEndTime, setPageEndTime] = React.useState(0)
  const [posts, setPosts] = React.useState([]);
  const LocalDB = getLocalDB()

  React.useEffect(()=>{
    setIsLoading(true)
    setPageEndTime(0)
    setHasMore(true)
    setPosts([])
    if(channel_id && isLoadedPost) {
      appendMoreData('first', 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel_id, isLoadedPost])

  const appendMoreData = React.useCallback((type, endTime=pageEndTime) => {
    let limit = 10
    let created_at: object = endTime? {$lt: endTime}: {$gt: true}
    if(type === "first") {
      limit = endTime? undefined: 10
      created_at = endTime? {$gte: endTime}: {$gt: true}
    }
    LocalDB.createIndex({
      index: {
        fields: ['created_at'],
      }
    })
      .then(_=>(
        LocalDB.find({
          selector: {
            table_type: 'post',
            channel_id,
            created_at
          },
          sort: [{'created_at': 'desc'}],
          limit
        })
      ))
      .then(response => {
        setIsLoading(false)
        if(response.docs.length<limit)
          setHasMore(false)
        if(type === 'first')
          setPosts(response.docs)
        else
          setPosts([...posts, ...response.docs])
        const pageEndPost = response.docs[response.docs.length-1]
        if(pageEndPost)
          setPageEndTime(pageEndPost['created_at'])
      })
      .catch(err=>setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageEndTime, channel_id])

  const loadingSkeletons = Array(5).fill(null)
  return (
    <>
      {
        !isLoading && !posts.length?
        <EmptyView type='post'/>:

        <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
          <Container sx={{ mt: 3, flexGrow: 1, overFlow: 'auto' }} maxWidth="lg">
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
  );
}

export default Channel;
