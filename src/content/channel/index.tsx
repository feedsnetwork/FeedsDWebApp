import React from 'react'
import { useSelector } from 'react-redux';

import { EmptyView } from 'components/EmptyView'
import { SidebarContext } from 'contexts/SidebarContext';
import PostGrid from './PostGrid';
import { selectFocusedChannelId, selectSelfChannelsCount } from 'redux/slices/channel';

function Channel() {
  const { publishPostNumber } = React.useContext(SidebarContext);
  const focusedChannelId = useSelector(selectFocusedChannelId)
  const selfChannelCount = useSelector(selectSelfChannelsCount)
  return (
    <>
      {
        !selfChannelCount?
        <EmptyView type='channel'/>:

        <PostGrid updateNumber={publishPostNumber} channel_id={focusedChannelId} postable={true}/>
      }
    </>
  );
}
export default Channel;