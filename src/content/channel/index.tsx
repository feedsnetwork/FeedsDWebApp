import React from 'react'
import { useSelector } from 'react-redux';
import InfiniteScroll from "react-infinite-scroll-component";
import { Grid, Container, Box } from '@mui/material';

import PostCard from 'components/PostCard';
import { EmptyView } from 'components/EmptyView'
import { SidebarContext } from 'contexts/SidebarContext';
import PostSkeleton from 'components/Skeleton/PostSkeleton'
import PostBox from './post'
import { selectFocusedChannelId } from 'redux/slices/channel';
import { getLocalDB, QueryStep } from 'utils/db';

function Channel() {
  const { queryStep, publishPostNumber } = React.useContext(SidebarContext);
  const focusedChannelId = useSelector(selectFocusedChannelId)
  const [posts, setPosts] = React.useState([]);
  const [selfChannelCount, setSelfChannelCount] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(0)
  const [hasMore, setHasMore] = React.useState(true)
  const [isLoading, setIsLoading] = React.useState(true)
  const [pageEndTime, setPageEndTime] = React.useState(0)
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
    if(queryStep) {
      setIsLoading(true)
    }
    if(focusedChannelId) {
      if(queryStep >= QueryStep.post_data) {
        appendMoreData('first')
        LocalDB.find({
          selector: {
            table_type: 'post',
            channel_id: focusedChannelId
          }
        })
          .then(response=>{
            setTotalCount(response.docs.length)
          })
      }
    }
    if(queryStep && !selfChannelCount) {
      LocalDB.find({
        selector: {
          is_self: true,
          table_type: 'channel'
        }
      })
        .then(res=>{
          setSelfChannelCount(res.docs.length)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedChannelId, publishPostNumber, queryStep])

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
            channel_id: focusedChannelId,
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
        !selfChannelCount?
        <EmptyView type='channel'/>:

        <>
          {
            !isLoading && !posts.length?
            <EmptyView type='post'/>:
            
            <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
              <Container sx={{ mt: 3, flexGrow: 1 }} maxWidth="lg">
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
              <PostBox/>
            </Box>
          }
        </>
      }
    </>
  );
}
export default Channel;