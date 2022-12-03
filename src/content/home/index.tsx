import React from 'react'
import { useSelector } from 'react-redux';
import { Grid, Container } from '@mui/material';
import InfiniteScroll from "react-infinite-scroll-component";

import PostCard from 'components/PostCard';
import { EmptyView } from 'components/EmptyView'
import PostSkeleton from 'components/Skeleton/PostSkeleton'
import { selectQueryStep } from 'redux/slices/proc';
import { getLocalDB } from 'utils/db';
import { selectLoadedPostCount } from 'redux/slices/post';

const Home = () => {
  const currentPostStep = useSelector(selectQueryStep('post_data'))
  const loadedPostCount = useSelector(selectLoadedPostCount)
  const [posts, setPosts] = React.useState([])
  const [hasMore, setHasMore] = React.useState(true)
  const [pageEndTime, setPageEndTime] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)
  const LocalDB = getLocalDB()
  console.info(currentPostStep, loadedPostCount)

  React.useEffect(()=>{
    if(loadedPostCount || currentPostStep){
      setPageEndTime(0)
      appendMoreData('first', 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedPostCount, currentPostStep])
  
  const appendMoreData = React.useCallback((type, endTime=pageEndTime) => {
    let limit = 10
    let created_at: object = endTime? {$lt: endTime}: {$gt: true}
    if(type === "first") {
      limit = endTime? undefined: 10
      created_at = endTime? {$gte: endTime}: {$gt: true}
    }

    LocalDB.find({
      selector: {
        table_type: 'channel',
        is_subscribed: true
      }
    })
      .then(response=>response.docs.map(doc=>doc._id))
      .then(channelIDs=>{
        LocalDB.createIndex({
          index: {
            fields: ['created_at'],
          }
        })
          .then(_=>(
            LocalDB.find({
              selector: {
                table_type: 'post',
                channel_id: { $in: channelIDs },
                created_at
              },
              sort: [{'created_at': 'desc'}],
              limit: 10
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
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageEndTime])

  const loadingSkeletons = Array(5).fill(null)
  return (
    <>
      {
        !isLoading && !posts.length?
        <EmptyView/>:

        <Container sx={{ my: 3 }} maxWidth="lg">
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
      }
    </>
  );
}

export default Home;
