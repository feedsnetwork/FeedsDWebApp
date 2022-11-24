import React from 'react'
import { useSelector } from 'react-redux'
import { Box, Stack, Card } from '@mui/material';

import PostBody from 'components/PostCard/PostBody'
import { selectUsers } from 'redux/slices/user';
import { decodeBase64, reduceDIDstring } from 'utils/common'
import { getLocalDB } from 'utils/db';
import { selectChannelById } from 'redux/slices/channel';

const CommentCard = (props) => {
  const { comment, direction='column' } = props
  const channel = useSelector(selectChannelById(comment.channel_id)) || {}
  const users = useSelector(selectUsers)
  const [commentData, setCommentData] = React.useState([])
  const LocalDB = getLocalDB()

  const commentUser = users[comment.creater_did] || {}
  let dispName = commentUser['name'] || reduceDIDstring(comment.creater_did)
  let dispAvatar = { name: commentUser['name'], src: decodeBase64(commentUser['avatarSrc'])}
  if(channel['target_did'] === comment.creater_did) {
    dispName = channel['name']
    dispAvatar = { name: channel['name'], src: decodeBase64(channel['avatarSrc']) }
  }

  const replyingTo = channel['owner_name'] || reduceDIDstring(channel['target_did'])
  const contentObj = {
    avatar: dispAvatar || {}, 
    primaryName: `@${dispName}`, 
    secondaryName: <><b>Replying to</b> @{replyingTo}</>, 
    content: comment.content
  }
  if(comment.status === 1)
    contentObj.content = "(post deleted)"

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
                const subBodyProps = { post: comment, contentObj: subContentObj, isReply: true, level: 2 }
                return <PostBody {...subBodyProps} key={_i}/>
              })
            }
          </Stack>
        }
      </Box>
    </Card>
  );
}

export default React.memo(CommentCard);
