import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { Box, Card } from '@mui/material';

import PostBody from './PostBody'
import { CommentForm } from './CommentForm';
import { decodeBase64, getImageSource, reduceDIDstring } from 'utils/common'
import { selectChannelById } from 'redux/slices/channel';

const PostCard = (props) => {
  const navigate = useNavigate();
  const { post, replyable=false, direction='column' } = props
  const channel = useSelector(selectChannelById(post.channel_id)) || {}
  const dispName = channel['owner_name'] || reduceDIDstring(channel['target_did'])
  const contentObj = typeof post.content === 'object'? {...post.content}: JSON.parse(post.content)
  contentObj.avatar = { name: channel['display_name'], src: (channel['avatarSrc'] || '') }
  contentObj.primaryName = channel['display_name']
  contentObj.secondaryName = `@${dispName}`
  contentObj.avatar.src = getImageSource(contentObj.avatar.src)
  if(post.status === 1)
    contentObj.content = "(post deleted)"

  const naviage2detail = (e) => {
    navigate(`/post/${post.post_id}`);
  }

  const cardProps = {style: {cursor: 'pointer'}, onClick: naviage2detail}
  const BodyProps = { post, contentObj, level: 1, direction }
  return (
    <Card {...cardProps}>
      <Box p={3}>
        <PostBody {...BodyProps}/>
        {
          replyable &&
          <CommentForm post={post} dispName={dispName}/>
        }
      </Box>
    </Card>
  );
}

export default React.memo(PostCard);