import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Card } from '@mui/material';

import PostBody from './PostBody'
import { CommentForm } from './CommentForm';
import { selectUsers } from 'redux/slices/user';
import { selectChannelAvatar } from 'redux/slices/channel';
import { decodeBase64, reduceDIDstring } from 'utils/common'
import { getLocalDB } from 'utils/db';

const PostCard = (props) => {
  const navigate = useNavigate();
  const { post, channel, dispName, level=1, replyingTo='', replyable=false, dispAvatar={}, direction='column' } = props
  const channelAvatars = useSelector(selectChannelAvatar)
  const users = useSelector(selectUsers)
  const [commentData, setCommentData] = React.useState([])
  const LocalDB = getLocalDB()

  const naviage2detail = (e) => {
    navigate(`/post/${post.post_id}`);
  }

  let contentObj = {avatar: {}, primaryName: '', secondaryName: null, content: ''}
  let cardProps = {}
  if(level === 1) {
    contentObj = typeof post.content === 'object'? {...post.content}: JSON.parse(post.content)
    contentObj.avatar = { name: channel['display_name'], src: channelAvatars[channel.channel_id]? decodeBase64(channelAvatars[channel.channel_id]): channel['avatarSrc']||'' }
    contentObj.primaryName = channel['display_name']
    contentObj.secondaryName = `@${dispName}`
    cardProps = {style: {cursor: 'pointer'}, onClick: naviage2detail}
  } 
  else if(level === 2) {
    contentObj.avatar = dispAvatar || {}
    contentObj.content = post.content
    contentObj.primaryName = `@${dispName}`
    contentObj.secondaryName = <><b>Replying to</b> @{replyingTo}</>
  }
  if(post.status === 1)
    contentObj.content = "(post deleted)"

  const BodyProps = { post, contentObj, level, direction }
  
  React.useEffect(()=>{
    if(level===2)
      LocalDB.find({
        selector: {
          table_type: 'comment',
          post_id: post.post_id,
          refcomment_id: post.comment_id
        }
      })
        .then(response => {
          setCommentData(response.docs)
        })
  }, [])

  return (
    <Card {...cardProps}>
      <Box p={3}>
        <PostBody {...BodyProps}/>
        {
          level===1 && replyable &&
          <CommentForm post={post} dispName={dispName}/>
        }
        {
          level===2 && commentData && 
          <Stack pl={3} pt={2} spacing={1}>
            {
              commentData.map((comment, _i)=>{
                const commentUser = users[comment.creator_did] || {}
                const subContentObj = {
                  avatar: { name: commentUser['name'], src: commentUser['avatarSrc']},
                  primaryName: `@${commentUser['name'] || reduceDIDstring(comment.creater_did)}`, 
                  secondaryName: <><b>Replying to</b> @{dispName}</>, 
                  content: comment.content
                }
                if(channel['target_did'] === comment.creater_did) {
                  subContentObj['avatar'] = { name: channel['display_name'], src: channel['avatarSrc']}
                  subContentObj['primaryName'] = `@${channel.display_name}`
                }
                const subBodyProps = { post: comment, contentObj: subContentObj, isReply: true, level }
                return <PostBody {...subBodyProps} key={_i}/>
              })
            }
          </Stack>
        }
      </Box>
    </Card>
  );
}

export default PostCard;
