import React from 'react'
import { useSelector } from 'react-redux';
import InfiniteScroll from "react-infinite-scroll-component";
import { Grid, Container, Box } from '@mui/material';

import PostCard from 'components/PostCard';
import { EmptyView } from 'components/EmptyView'
import { SidebarContext } from 'contexts/SidebarContext';
import PostSkeleton from 'components/Skeleton/PostSkeleton'
import PostBox from './post'
import { reduceDIDstring } from 'utils/common'
import { selectDispNameOfChannels, selectFocusedChannelId } from 'redux/slices/channel';
import { LocalDB, QueryStep } from 'utils/db';

function Channel() {
  const { queryStep, publishPostNumber } = React.useContext(SidebarContext);
  const focusedChannelId = useSelector(selectFocusedChannelId)
  const channelDispName = useSelector(selectDispNameOfChannels)
  const [posts, setPosts] = React.useState([]);
  const [channelInfo, setChannelInfo] = React.useState({});
  const [selfChannelCount, setSelfChannelCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasMore, setHasMore] = React.useState(false)
  const feedsDid = sessionStorage.getItem('FEEDS_DID')

  React.useEffect(()=>{
    if(focusedChannelId) {
      if(queryStep >= QueryStep.self_channel && !posts.length)
        setIsLoading(true)
      if(queryStep >= QueryStep.post_data) {
        LocalDB.find({
          selector: {
            table_type: 'post',
            channel_id: focusedChannelId,
            created_at: {$exists: true}
          },
          sort: [{'created_at': 'desc'}],
        })
          .then(response => {
            setIsLoading(false)
            setPosts(response.docs)
          })
      }
      if(queryStep >= QueryStep.subscribed_channel) {
        LocalDB.get(focusedChannelId.toString())
          .then(doc=>{
            setChannelInfo(doc)
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

  React.useEffect(()=>{
    if(!posts.length)
      return
    const timeRange = channelInfo['time_range'] || []
    if(!timeRange.length || !timeRange[0]['start'])
      setHasMore(false)
    else {
      setHasMore(true)
    }
  }, [posts, channelInfo])

  const appendMoreData = () => {

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
                          <PostCard post={post} channel={channelInfo} dispName={channelDispName[focusedChannelId] || reduceDIDstring(feedsDid)}/>
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
