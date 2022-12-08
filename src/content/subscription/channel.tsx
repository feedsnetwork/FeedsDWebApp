import { useSelector } from 'react-redux';
import { selectVisitedChannelId } from 'redux/slices/channel'
import PostGrid from 'content/channel/PostGrid';

function Channel() {
  const channel_id = useSelector(selectVisitedChannelId)
  return (
    <PostGrid channel_id={channel_id}/>
  );
}
export default Channel;
