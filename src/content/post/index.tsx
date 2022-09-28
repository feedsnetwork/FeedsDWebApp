import React from 'react'
import { useParams } from 'react-router-dom';
import { Grid, Container, Box, Typography, Stack } from '@mui/material';

import PostCard from 'src/components/PostCard';
import { EmptyView } from 'src/components/EmptyView'
import PostSkeleton from 'src/components/Skeleton/PostSkeleton'
import { reduceDIDstring, getAppPreference, sortByDate, getMergedArray } from 'src/utils/common'
import { SidebarContext } from 'src/contexts/SidebarContext';
import { HiveApi } from 'src/services/HiveApi'

const Post = () => {
  const { postsInSubs, selfChannels, subscribedChannels } = React.useContext(SidebarContext);
  const params = useParams()
  const [dispNames, setDispNames] = React.useState({})
  const [dispAvatar, setDispAvatar] = React.useState({})
  const hiveApi = new HiveApi()
  const postsInHome = getMergedArray(postsInSubs)
  const selectedPost = postsInHome.find(item=>item.post_id == params.post_id)
  const currentChannel = [...selfChannels, ...subscribedChannels].find(item=>item.channel_id==selectedPost.channel_id) || {}
  const comments = selectedPost.commentData || []
  
  // console.log(selectedPost, comments, "++++11")
  const targetDID = `did:elastos:${selectedPost.target_did}`
  React.useEffect(()=>{
    hiveApi.queryUserDisplayName(targetDID, selectedPost.channel_id, targetDID)
      .then(dispNameRes=>{
        if(dispNameRes['find_message'] && dispNameRes['find_message']['items']) {
          const dispItem = dispNameRes['find_message']['items'][0]
          setDispNames(prevState=>{
            const tempPrev = {...prevState}
            tempPrev[selectedPost.post_id] = dispItem.display_name
            return tempPrev
          })
        }
      })
    getCreatorDispNames(comments)
  }, [])

  const getCreatorDispNames = (comments_arr) => {
    if(comments_arr)
      comments_arr.forEach(comment=>{
        if(comment.creater_did == targetDID) {
          setDispAvatar(prevState=>{
            const tempPrev = {...prevState}
            tempPrev[comment.comment_id] = { name: currentChannel.name, src: currentChannel.avatarSrc }
            return tempPrev
          })
        } else {
          hiveApi.getHiveUrl(comment.creater_did)
            .then(async hiveUrl=>{
              const res =  await hiveApi.downloadFileByHiveUrl(comment.creater_did, hiveUrl)
              if(res && res.length) {
                const base64Content = res.toString('base64')
                setDispAvatar(prevState=>{
                  const tempPrev = {...prevState}
                  tempPrev[comment.comment_id] = { src: `data:image/png;base64,${base64Content}` }
                  return tempPrev
                })
              }
            })
        }
        hiveApi.queryUserDisplayName(targetDID, selectedPost.channel_id, comment.creater_did)
          .then(dispNameRes=>{
            if(dispNameRes['find_message'] && dispNameRes['find_message']['items']) {
              const dispItem = dispNameRes['find_message']['items'][0]
              setDispNames(prevState=>{
                const tempPrev = {...prevState}
                tempPrev[comment.comment_id] = dispItem.display_name
                return tempPrev
              })
            }
          })
        if(comment.commentData)
          getCreatorDispNames(comment.commentData)
      })
  }

  const dispNameOfPost = dispNames[selectedPost.post_id] || reduceDIDstring(selectedPost.target_did)
  return (
    <Container sx={{ my: 3 }} maxWidth="lg">
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={3}
      >
        <Grid item xs={12}>
          <PostCard post={selectedPost} dispName={dispNameOfPost} replyable={true}/>
        </Grid>
        {
          comments.map((comment, _i)=>{
            const dispNameOfComment = dispNames[comment.comment_id] || reduceDIDstring(comment.creater_did)
            return <Grid item xs={12} key={_i}>
              <PostCard post={comment} dispName={dispNameOfComment} dispNames={dispNames} dispAvatar={dispAvatar} level={2} replyingTo={dispNameOfPost}/>
            </Grid>
          })
        }
      </Grid>
    </Container>
  );
}

export default Post;
