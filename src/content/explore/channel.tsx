import { useSelector } from 'react-redux'
import PostGrid from 'content/channel/PostGrid';
import { selectVisitedChannelId } from 'redux/slices/channel';

function Channel() {
  const channel_id = useSelector(selectVisitedChannelId)
  return (
    <PostGrid channel_id={channel_id}/>
  );
}

export default Channel;
