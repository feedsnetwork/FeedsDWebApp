import React from 'react'
import InfiniteScroll from "react-infinite-scroll-component";
import { Grid, Container, Box } from '@mui/material';

import PostCard from 'components/PostCard';
import { EmptyView } from 'components/EmptyView'
import { SidebarContext } from 'contexts/SidebarContext';
import PostSkeleton from 'components/Skeleton/PostSkeleton'
import PostBox from './post'
import { reduceDIDstring } from 'utils/common'
import { LocalDB, QueryStep } from 'utils/db';

function Channel() {
  const { queryStep, focusedChannelId, publishPostNumber } = React.useContext(SidebarContext);
  const [posts, setPosts] = React.useState([]);
  const [channelInfo, setChannelInfo] = React.useState({});
  const [selfChannelCount, setSelfChannelCount] = React.useState(0);
  const [totalCount, setTotalCount] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [pageEndTime, setPageEndTime] = React.useState(0)
  const feedsDid = sessionStorage.getItem('FEEDS_DID')

  React.useEffect(()=>{
    if(queryStep < QueryStep.post_data)
      setIsLoading(true)
    else if(queryStep >= QueryStep.post_data && focusedChannelId) {
      setIsLoading(false)
      appendMoreData()
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
    if(queryStep >= QueryStep.channel_dispname && focusedChannelId) {
      LocalDB.get(focusedChannelId.toString())
        .then(doc=>{
          setChannelInfo(doc)
        })
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
  }, [focusedChannelId, publishPostNumber, queryStep])

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
            channel_id: focusedChannelId,
            created_at: pageEndTime? {$lt: pageEndTime}: {$gt: true}
          },
          sort: [{'created_at': 'desc'}],
          limit: 10
        })
      ))
      .then(response => {
        setPosts([...posts, ...response.docs])
        const pageEndPost = response.docs[response.docs.length-1]
        if(pageEndPost)
          setPageEndTime(pageEndPost['created_at'])
      })
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

                      posts.map((post, _i)=>(
                        <Grid item xs={12} key={_i}>
                          <PostCard post={post} channel={channelInfo} dispName={channelInfo['owner_name'] || reduceDIDstring(feedsDid)}/>
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
