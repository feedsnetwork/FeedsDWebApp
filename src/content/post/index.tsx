import React from 'react'
import { useParams } from 'react-router-dom';
import { Grid, Container, Box, Typography, Stack } from '@mui/material';

import PostCard from 'components/PostCard';
import { EmptyView } from 'components/EmptyView'
import PostSkeleton from 'components/Skeleton/PostSkeleton'
import { reduceDIDstring, getAppPreference, sortByDate, getMergedArray } from 'utils/common'
import { SidebarContext } from 'contexts/SidebarContext';
import { LocalDB, QueryStep } from 'utils/db';

const Post = () => {
  const { queryStep } = React.useContext(SidebarContext);
  const params = useParams()
  const [postInfo, setPostInfo] = React.useState(null)
  const [channelInfo, setChannelInfo] = React.useState({})
  const [users, setUsers] = React.useState([])
  const [comments, setComments] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(false)
  
  React.useEffect(()=>{
    if(queryStep < QueryStep.post_data)
      setIsLoading(true)
    else if(queryStep >= QueryStep.post_data) {
      setIsLoading(false)
      LocalDB.get(params.post_id.toString())
        .then(doc=>{
          setPostInfo(doc)
          return LocalDB.get(doc['channel_id'].toString())
        })
        .then(doc=>setChannelInfo(doc))
      LocalDB.find({
        selector: {
          table_type: 'comment',
          post_id: params.post_id
        }
      })
        .then(response=>{
          setComments(response.docs)
        })
    }
    if(queryStep >= QueryStep.subscriber_info) {
      LocalDB.find({
        selector: {
          table_type: 'user'
        }
      })
        .then(response=>setUsers(response.docs))
    }
  }, [queryStep])

  const loadingSkeletons = Array(5).fill(null)
  const dispNameOfPost = channelInfo['owner_name'] || reduceDIDstring(channelInfo['target_did'])
  return (
    <Container sx={{ my: 3 }} maxWidth="lg">
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="stretch"
        spacing={3}
      >
        {
          isLoading?
          loadingSkeletons.map((_, _i)=>(
            <Grid item xs={12} key={_i}>
              <PostSkeleton/>
            </Grid>
          )):

          <>
            {
              !!postInfo &&
              <Grid item xs={12}>
                <PostCard post={postInfo} channel={channelInfo} dispName={dispNameOfPost} replyable={true}/>
              </Grid>
            }
            {
              comments.map((comment, _i)=>{
                const commentUser = users.find(user=>user['_id']===comment.creator_did) || {}
                const commentProps = {
                  post: comment,
                  channel: channelInfo,
                  dispName: commentUser['name'] || reduceDIDstring(comment.creater_did),
                  dispAvatar: commentUser['avatarSrc'],
                  replyingTo: dispNameOfPost,
                  users,
                  level: 2
                }
                if(channelInfo['target_did'] === comment.creater_did) {
                  commentProps['dispName'] = channelInfo['name']
                  commentProps['dispAvatar'] = channelInfo['avatarSrc']
                }
                return <Grid item xs={12} key={_i}>
                  <PostCard {...commentProps}/>
                </Grid>
              })
            }
          </>
        }
      </Grid>
    </Container>
  );
}

export default Post;
