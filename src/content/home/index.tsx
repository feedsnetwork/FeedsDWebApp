import React from 'react'
import { useSelector } from 'react-redux';
import { Grid, Container } from '@mui/material';
import InfiniteScroll from "react-infinite-scroll-component";

import PostCard from 'components/PostCard';
import { EmptyView } from 'components/EmptyView'
import PostSkeleton from 'components/Skeleton/PostSkeleton'
import { SidebarContext } from 'contexts/SidebarContext';
import { reduceDIDstring } from 'utils/common'
import { selectDispNameOfChannels } from 'redux/slices/channel';
import { getLocalDB, QueryStep } from 'utils/db';

const Home = () => {
  const { queryStep } = React.useContext(SidebarContext);
  const [channels, setChannels] = React.useState([])
  const [posts, setPosts] = React.useState([])
  const [totalCount, setTotalCount] = React.useState(0)
  const [pageEndTime, setPageEndTime] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(true)
  const channelDispName = useSelector(selectDispNameOfChannels)
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
    if(queryStep >= QueryStep.post_data) {
      
      appendMoreData()
      LocalDB.find({
        selector: {
          table_type: 'post',
        }
      })
        .then(response => {
          setTotalCount(response.docs.length)
        })
    }
    if(queryStep && !channels.length) {
      LocalDB.find({
        selector: {
          table_type: 'channel'
        }
      })
        .then(response => {
          setChannels(response.docs)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryStep])
  
  const appendMoreData = () => {
    LocalDB.createIndex({
      index: {
        fields: ['created_at'],
      }
    })
      .then(_=>(
        LocalDB.find({
          selector: {
            table_type: 'post',
            created_at: pageEndTime? {$lt: pageEndTime}: {$gt: true}
          },
          sort: [{'created_at': 'desc'}],
          limit: 10
        })
      ))
      .then(response => {
        setPosts([...posts, ...response.docs])
        setIsLoading(false)
        const pageEndPost = response.docs[response.docs.length-1]
        if(pageEndPost)
          setPageEndTime(pageEndPost['created_at'])
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
            hasMore={posts.length<totalCount}
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

                posts.map((post, _i)=>{
                  const channelOfPost = channels.find(item=>item.channel_id === post.channel_id) || {}
                  return (
                    <Grid item xs={12} key={_i}>
                      <PostCard post={post} channel={channelOfPost} dispName={channelDispName[post.channel_id] || reduceDIDstring(post.target_did)}/>
                    </Grid>
                  )
                })
              }
            </Grid>
          </InfiniteScroll>
        </Container>
      }
    </>
  );
}

export default Home;
