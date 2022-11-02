import React from 'react'
import { useSelector } from 'react-redux'

import PostList from 'components/PostList';
import { SidebarContext } from 'contexts/SidebarContext';
import { selectDispNameOfChannels, selectVisitedChannelId } from 'redux/slices/channel';
import { reduceDIDstring } from 'utils/common'
import { LocalDB, QueryStep } from 'utils/db';
import { getDocId, getTableType } from 'utils/mainproc';

function Channel() {
  const { queryPublicStep } = React.useContext(SidebarContext);
  const channel_id = useSelector(selectVisitedChannelId)
  const [isLoading, setIsLoading] = React.useState(false)
  const [totalCount, setTotalCount] = React.useState(0)
  const [channelInfo, setChannelInfo] = React.useState({});
  const [pageEndTime, setPageEndTime] = React.useState(0)
  const [posts, setPosts] = React.useState([]);
  const dispNameOfChannels = useSelector(selectDispNameOfChannels)

  React.useEffect(()=>{
    if(queryPublicStep >= QueryStep.public_channel)
      setIsLoading(true)
    if(queryPublicStep >= QueryStep.post_data && channel_id) {
      appendMoreData()
      LocalDB.find({
        selector: {
          table_type: getTableType('post', true),
          channel_id
        }
      })
        .then(res=>{
          setTotalCount(res.docs.length)
        })
    }
    if(queryPublicStep && channel_id) {
      LocalDB.get(getDocId(channel_id, true))
        .then(doc=>{
          setChannelInfo(doc)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryPublicStep, channel_id])

  const appendMoreData = () => {
    LocalDB.createIndex({
      index: {
        fields: ['created_at'],
      }
    })
      .then(_=>(
        LocalDB.find({
          selector: {
            table_type: getTableType('post', true),
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

  const postListProps = { 
    isLoading, 
    posts, 
    channel: channelInfo,
    dispName: dispNameOfChannels[channel_id] || reduceDIDstring(channelInfo['target_did']),
    appendMoreData, 
    hasMore: posts.length < totalCount 
  }
  return (
    <PostList {...postListProps}/>
  );
}

export default Channel;
