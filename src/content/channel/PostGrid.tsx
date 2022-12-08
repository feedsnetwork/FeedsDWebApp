import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import InfiniteScroll from "react-infinite-scroll-component";
import { Grid, Container, Box } from '@mui/material';

import PostCard from 'components/PostCard';
import { EmptyView } from 'components/EmptyView'
import PostSkeleton from 'components/Skeleton/PostSkeleton'
import PostBox from './post'
import { selectIsLoadedPost } from 'redux/slices/channel';
import { getLocalDB } from 'utils/db';
import { nextproc } from 'utils/mainproc';

function PostGrid(props) {
  const { updateNumber=0, channel_id, postable=false } = props
  const isLoadedPost = useSelector(selectIsLoadedPost(channel_id))
  const [posts, setPosts] = React.useState([]);
  const [timeRange, setTimeRange] = React.useState([]);
  const [totalCount, setTotalCount] = React.useState(0)
  const [hasMore, setHasMore] = React.useState(true)
  const [isLoading, setIsLoading] = React.useState(true)
  const [pageEndTime, setPageEndTime] = React.useState(0)
  const LocalDB = getLocalDB()
  const dispatch = useDispatch()
  const propsInProc = { dispatch }
  const proc = nextproc(propsInProc)

  console.info(timeRange)
  React.useEffect(()=>{
    setIsLoading(true)
    setPageEndTime(0)
    setPosts([])
    if(isLoadedPost)
      loadPostData(channel_id, 0)
    LocalDB.get(channel_id)
      .then(doc=>setTimeRange(doc['time_range']))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel_id, isLoadedPost])
  React.useEffect(()=>{
    if(updateNumber && isLoadedPost) {
      loadPostData(channel_id, pageEndTime)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateNumber])

  const loadPostData = (channel_id, endTime) => {
    appendMoreData('first', endTime)
    LocalDB.find({
      selector: {
        table_type: 'post',
        channel_id
      }
    })
      .then(response=>{
        setTotalCount(response.docs.length)
      })
  }
  const streamNextPage = React.useCallback(() => {
    if(timeRange.length<2 && !timeRange[0]?.start) {
      setHasMore(false)
      return
    }
    proc.nextStreamByChannelId(channel_id, setPosts, setHasMore)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel_id, timeRange])
  const appendMoreData = React.useCallback((type, endTime=pageEndTime) => {
    if(posts.length >= totalCount) {
      streamNextPage()
    }
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
          streamNextPage()
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
          <Container sx={{ mt: 3, flexGrow: 1, px: { xs: 3, sm: 6} }} maxWidth="lg">
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
          {
            postable &&
            <PostBox/>
          }
        </Box>
      }
    </>
  );
}
export default React.memo(PostGrid)