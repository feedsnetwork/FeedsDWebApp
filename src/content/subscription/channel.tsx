import React from 'react'
import { useSelector } from 'react-redux';
import InfiniteScroll from "react-infinite-scroll-component";
import { Box, Container, Grid } from '@mui/material';

import PostSkeleton from 'components/Skeleton/PostSkeleton'
import PostCard from 'components/PostCard';
import { EmptyView } from 'components/EmptyView'
import { SidebarContext } from 'contexts/SidebarContext';
import { reduceDIDstring } from 'utils/common'
import { LocalDB, QueryStep } from 'utils/db'
import { selectVisitedChannelId, selectDispNameOfChannels } from 'redux/slices/channel'

function Channel() {
  const channel_id = useSelector(selectVisitedChannelId)
  const dispNameOfChannels = useSelector(selectDispNameOfChannels)
  const { queryStep } = React.useContext(SidebarContext);
  const [isLoading, setIsLoading] = React.useState(false)
  const [totalCount, setTotalCount] = React.useState(0)
  const [pageEndTime, setPageEndTime] = React.useState(0)
  const [channelInfo, setChannelInfo] = React.useState({});
  const [posts, setPosts] = React.useState([]);

  React.useEffect(()=>{
    if(queryStep >= QueryStep.subscribed_channel)
      setIsLoading(true)
    if(queryStep >= QueryStep.post_data && channel_id) {
      appendMoreData()
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
    if(queryStep && channel_id) {
      LocalDB.get(channel_id.toString())
        .then(doc=>{
          setChannelInfo(doc)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryStep, channel_id])

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
            channel_id,
            created_at: pageEndTime? {$lt: pageEndTime}: {$gt: true}
          },
          sort: [{'created_at': 'desc'}],
          limit: 10
        })
      ))
      .then(response => {
        setIsLoading(false)
        setPosts([...posts, ...response.docs])
        const pageEndPost = response.docs[response.docs.length-1]
        if(pageEndPost)
          setPageEndTime(pageEndPost['created_at'])
      })
      .catch(err=>setIsLoading(false))
  }

  const dispName = dispNameOfChannels[channel_id] || reduceDIDstring(channelInfo['target_did']) 
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
                      <PostCard post={post} channel={channelInfo} dispName={dispName}/>
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
