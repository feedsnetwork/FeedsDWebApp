import React from 'react'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Grid, Container } from '@mui/material';

import PostCard from 'components/PostCard';
import PostSkeleton from 'components/Skeleton/PostSkeleton'
import { SidebarContext } from 'contexts/SidebarContext';
import { selectUsers } from 'redux/slices/user';
import { selectDispNameOfChannels } from 'redux/slices/channel';
import { selectActivePost } from 'redux/slices/post';
import { decodeBase64, reduceDIDstring } from 'utils/common'
import { getLocalDB, QueryStep } from 'utils/db';

const Post = () => {
  const { queryStep, publishPostNumber } = React.useContext(SidebarContext);
  const params = useParams()
  const [postInfo, setPostInfo] = React.useState(null)
  const [channelInfo, setChannelInfo] = React.useState({})
  const [dispNameOfPost, setDispNameOfPost] = React.useState('')
  const [comments, setComments] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(true)
  const channelDispName = useSelector(selectDispNameOfChannels)
  const users = useSelector(selectUsers)
  const activePost = useSelector(selectActivePost)
  const LocalDB = getLocalDB()

  React.useEffect(()=>{
    const channelId = channelInfo['channel_id']
    if(channelId) {
      setDispNameOfPost(
        channelDispName[channelId] || reduceDIDstring(channelInfo['target_did'])
      )
    }
  }, [channelInfo, channelDispName])

  React.useEffect(()=>{
    if(queryStep >= QueryStep.post_data)
      LocalDB.get(params.post_id.toString())
        .then(doc=>{
          setPostInfo(doc)
          return LocalDB.get(doc['channel_id'].toString())
        })
        .then(doc=>setChannelInfo(doc))
    if(queryStep >= QueryStep.comment_data)
      getComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryStep])

  React.useEffect(()=>{
    if(publishPostNumber && activePost['post_id']===params.post_id) {
      getComments()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publishPostNumber])

  const getComments = ()=>{
    LocalDB.find({
      selector: {
        table_type: 'comment',
        post_id: params.post_id,
        created_at: {$exists: true}
      },
      sort: [{'created_at': 'desc'}],
    })
      .then(response=>{
        setIsLoading(false)
        setComments(response.docs)
      })
  }
  const loadingSkeletons = Array(5).fill(null)
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
          !!postInfo &&
          <Grid item xs={12}>
            <PostCard post={postInfo} replyable={true}/>
          </Grid>
        }
        {
          isLoading?
          loadingSkeletons.map((_, _i)=>(
            <Grid item xs={12} key={_i}>
              <PostSkeleton/>
            </Grid>
          )):
          comments.map((comment, _i)=>{
            const commentUser = users[comment.creater_did] || {}
            const commentProps = {
              post: comment,
              dispName: commentUser['name'] || reduceDIDstring(comment.creater_did),
              dispAvatar: { name: commentUser['name'], src: decodeBase64(commentUser['avatarSrc'])},
              replyingTo: dispNameOfPost,
              level: 2
            }
            if(channelInfo['target_did'] === comment.creater_did) {
              commentProps['dispName'] = channelInfo['name']
              commentProps['dispAvatar'] = { name: channelInfo['name'], src: channelInfo['avatarSrc'] }
            }
            return <Grid item xs={12} key={_i}>
              <PostCard {...commentProps}/>
            </Grid>
          })
        }
      </Grid>
    </Container>
  );
}

export default Post;
