import React from 'react'
import { useSelector } from 'react-redux';
import { Grid, Container } from '@mui/material';
import InfiniteScroll from "react-infinite-scroll-component";

import PostCard from 'components/PostCard';
import { EmptyView } from 'components/EmptyView'
import PostSkeleton from 'components/Skeleton/PostSkeleton'
import { selectQueryStep } from 'redux/slices/proc';
import { getLocalDB } from 'utils/db';

const Home = () => {
  const currentPostStep = useSelector(selectQueryStep('post_data'))
  const [posts, setPosts] = React.useState([])
  const [hasMore, setHasMore] = React.useState(true)
  const [pageEndTime, setPageEndTime] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)
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
    if(currentPostStep) {
      appendMoreData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPostStep])

  const appendMoreData = () => {
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
                created_at: pageEndTime? {$lt: pageEndTime}: {$gt: true}
              },
              sort: [{'created_at': 'desc'}],
              limit: 10
            })
          ))
          .then(response => {
            if(response.docs.length<10)
              setHasMore(false)
            setPosts([...posts, ...response.docs])
            setIsLoading(false)
            const pageEndPost = response.docs[response.docs.length-1]
            if(pageEndPost)
              setPageEndTime(pageEndPost['created_at'])
          })
      })
  }

  const loadingSkeletons = Array(5).fill(null)
  return (
    <>
      {
        !isLoading && !posts.length?
        <EmptyView/>:

        <Container sx={{ my: 3 }} maxWidth="lg">
          <InfiniteScroll
            dataLength={posts.length}
            next={appendMoreData}
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
