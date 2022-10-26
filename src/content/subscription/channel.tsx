import React from 'react'
import { useSelector } from 'react-redux';

import PostList from 'components/PostList';
import { SidebarContext } from 'contexts/SidebarContext';
import { reduceDIDstring, sortByDate } from 'utils/common'
import { LocalDB, QueryStep } from 'utils/db'
import { selectActiveChannelId, selectDispNameOfChannels } from 'redux/slices/channel'

function Channel() {
  const channel_id = useSelector(selectActiveChannelId)
  const dispNameOfChannels = useSelector(selectDispNameOfChannels)
  const { queryStep, publishPostNumber } = React.useContext(SidebarContext);
  const [isLoading, setIsLoading] = React.useState(false)
  const [channelInfo, setChannelInfo] = React.useState({});
  const [posts, setPosts] = React.useState([]);

  React.useEffect(()=>{
    if(queryStep < QueryStep.post_data)
      setIsLoading(true)
    else if(queryStep >= QueryStep.post_data && channel_id) {
      setIsLoading(false)
      LocalDB.find({
        selector: {
          channel_id: channel_id,
          table_type: 'post'
        }
      })
        .then(res=>{
          setPosts(sortByDate(res.docs))
        })
    }
    if(queryStep && channel_id) {
      LocalDB.get(channel_id.toString())
        .then(doc=>{
          setChannelInfo(doc)
        })
    }
  }, [publishPostNumber, queryStep, channel_id])

  const postListProps = { 
    isLoading, 
    postsInActiveChannel: posts, 
    channel: channelInfo, 
    dispName: dispNameOfChannels[channel_id] || reduceDIDstring(channelInfo['target_did']) 
  }
  return (
    <PostList {...postListProps}/>
  );
}

export default Channel;
