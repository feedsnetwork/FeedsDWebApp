import React from 'react'
import { useSelector } from 'react-redux';
import InfiniteScroll from "react-infinite-scroll-component";
import { Box, Container, Grid } from '@mui/material';

import PostSkeleton from 'components/Skeleton/PostSkeleton'
import PostCard from 'components/PostCard';
import { EmptyView } from 'components/EmptyView'
import { getLocalDB } from 'utils/db'
import { selectVisitedChannelId } from 'redux/slices/channel'
import { selectQueryStep } from 'redux/slices/proc';

function Channel() {
  const channel_id = useSelector(selectVisitedChannelId)
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasMore, setHasMore] = React.useState(true)
  const [totalCount, setTotalCount] = React.useState(0)
  const [pageEndTime, setPageEndTime] = React.useState(0)
  const [posts, setPosts] = React.useState([]);
  const currentPostStep = useSelector(selectQueryStep('post_data'))
  const LocalDB = getLocalDB()

  React.useEffect(()=>{
    LocalDB.get('query-step')
      .then(currentStep=>{
        if(!currentStep['step'])
          setIsLoading(false)
      })
      .catch(_=>setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  React.useEffect(()=>{
    setPageEndTime(0)
  }, [channel_id])
  React.useEffect(()=>{
    if(currentPostStep)
      setIsLoading(true)
    if(currentPostStep && channel_id) {
      appendMoreData('first')
      LocalDB.find({
        selector: {
          table_type: 'post',
          channel_id: channel_id
        }
      })
        .then(res=>{
          setTotalCount(res.docs.length)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPostStep, channel_id])

  const appendMoreData = (type) => {
    let limit = 10
    let createdAt: object = pageEndTime? {$lt: pageEndTime}: {$gt: true}
    if(type === "first") {
      limit = pageEndTime? undefined: 10
      createdAt = pageEndTime? {$gte: pageEndTime}: {$gt: true}
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
            created_at: createdAt
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
  }

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
              hasMore={posts.length<totalCount || hasMore}
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
