import React from 'react'
import { NavLink as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux'
import { Box, Stack, Card, Link } from '@mui/material';

import PostBody from 'components/PostCard/PostBody'
import { selectUserInfoByDID } from 'redux/slices/user';
import { decodeBase64, getShortDIDstring, reduceDIDstring } from 'utils/common'
import { getLocalDB } from 'utils/db';
import { selectChannelById } from 'redux/slices/channel';

const GetContentObj = (comment, channel, commentUser, parentReplyingTo='') => {
  const [replyingDID, setReplyingDID] = React.useState('')
  const LocalDB = getLocalDB()
  const isCommentReply = !!parseInt(comment['refcomment_id'], 16)
  React.useEffect(()=>{
    LocalDB.get(isCommentReply? comment['refcomment_id']: comment['post_id'])
      .then(doc=>{
        setReplyingDID(isCommentReply? doc['creater_did']: doc['target_did'])
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comment['refcomment_id']])
  
  let dispName = commentUser['name'] || reduceDIDstring(comment.creater_did)
  let dispAvatar = { name: commentUser['name'], src: decodeBase64(commentUser['avatarSrc'])}
  const replyingTo = channel['owner_name'] || reduceDIDstring(channel['target_did'])
  const contentObj = {
    avatar: dispAvatar || {}, 
    primaryName: `@${dispName}`, 
    secondaryName: <>
      <b>Replying to</b>&nbsp;
      <Link component={RouterLink} to={`/profile/others/${getShortDIDstring(replyingDID)}`} color="inherit">
        {parentReplyingTo || `@${replyingTo}`}
      </Link>
    </>, 
    content: comment.content
  }
  if(channel['target_did'] === comment.creater_did) {
    contentObj.primaryName = `@${channel['display_name']}`
    contentObj.avatar = { name: channel['display_name'], src: decodeBase64(channel['avatarSrc']), isChannel: true }
  }
  if(comment.status === 1)
    contentObj.content = "(post deleted)"
  return contentObj
}
const SubCommentPaper = (props) => {
  const { comment, channel, parentReplyingTo } = props
  const commentUser = useSelector(selectUserInfoByDID(comment.creater_did)) || {}
  const contentObj = GetContentObj(comment, channel, commentUser, parentReplyingTo)
  const bodyProps = { post: comment, contentObj, isReply: true, level: 2 }
  return <PostBody {...bodyProps}/>
}
const CommentCard = (props) => {
  const { comment, direction='column' } = props
  const channel = useSelector(selectChannelById(comment.channel_id)) || {}
  const commentUser = useSelector(selectUserInfoByDID(comment.creater_did)) || {}
  const [commentData, setCommentData] = React.useState([])
  const LocalDB = getLocalDB()
  const contentObj = GetContentObj(comment, channel, commentUser)
  const BodyProps = { post: comment, contentObj, level: 2, direction }
  
  React.useEffect(()=>{
    LocalDB.find({
      selector: {
        table_type: 'comment',
        post_id: comment.post_id,
        refcomment_id: comment.comment_id
      }
    })
      .then(response => {
        setCommentData(response.docs)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card>
      <Box p={3}>
        <PostBody {...BodyProps}/>
        {
          commentData.length>0 && 
          <Stack pl={3} pt={2} spacing={1}>
            {
              commentData.map((subComment, _i)=><SubCommentPaper comment={subComment} channel={channel} parentReplyingTo={contentObj.primaryName} key={_i}/>)
            }
          </Stack>
        }
      </Box>
    </Card>
  );
}

export default React.memo(CommentCard);
