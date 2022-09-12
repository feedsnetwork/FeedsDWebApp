import React from 'react'
import { useParams } from 'react-router-dom';
import { Grid, Container, Box, Typography, Stack } from '@mui/material';

import PostCard from 'src/components/PostCard';
import { EmptyView } from 'src/components/EmptyView'
import PostSkeleton from 'src/components/Skeleton/PostSkeleton'
import { reduceDIDstring, getAppPreference, sortByDate } from 'src/utils/common'
import { SidebarContext } from 'src/contexts/SidebarContext';
import { HiveApi } from 'src/services/HiveApi'

const Post = () => {
  const { postsInHome } = React.useContext(SidebarContext);
  const params = useParams()
  const [isLoading, setIsLoading] = React.useState(false)
  const [dispNames, setDispNames] = React.useState({})
  const prefConf = getAppPreference()
  const hiveApi = new HiveApi()
  const selectedPost = postsInHome.find(item=>item.post_id == params.post_id)
  const comments = selectedPost.commentData || []
  
  console.log(selectedPost, comments, "++++11")
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
    comments.forEach(comment=>{
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
    })
  }, [])
  console.log(dispNames, "======@")
  const dispNameOfPost = dispNames[selectedPost.post_id] || reduceDIDstring(selectedPost.target_did)
  return (
    <>
      <Container sx={{ my: 3 }} maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12}>
            <PostCard post={selectedPost} dispName={dispNameOfPost}/>
          </Grid>
          {
            comments.map((comment, _i)=>{
              const dispNameOfComment = dispNames[comment.comment_id] || reduceDIDstring(comment.creater_did)
              return <Grid item xs={12} key={_i}>
                <PostCard post={comment} dispName={dispNameOfComment} level={2} replyingTo={dispNameOfPost}/>
              </Grid>
            })
          }
        </Grid>
      </Container>
    </>
  );
}

export default Post;
