import React from 'react'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Grid, Container } from '@mui/material';

import PostCard from 'components/PostCard';
import CommentCard from 'components/CommentCard';
import PostSkeleton from 'components/Skeleton/PostSkeleton'
import { SidebarContext } from 'contexts/SidebarContext';
import { selectActivePost } from 'redux/slices/post';
import { selectQueryStep } from 'redux/slices/proc';
import { filterSelfComment } from 'utils/common';
import { getLocalDB } from 'utils/db';

const Post = () => {
  const { publishPostNumber } = React.useContext(SidebarContext);
  const params = useParams()
  const [postInfo, setPostInfo] = React.useState(null)
  const [comments, setComments] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(true)
  const activePost = useSelector(selectActivePost)
  const currentPostStep = useSelector(selectQueryStep('post_data'))
  const currentCommentStep = useSelector(selectQueryStep('comment_data'))
  const LocalDB = getLocalDB()

  React.useEffect(()=>{
    if(currentPostStep && !postInfo)
      LocalDB.get(params.post_id)
        .then(doc=>{
          setPostInfo(doc)
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPostStep])

  React.useEffect(()=>{
    if(currentCommentStep)
      getComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCommentStep])

  React.useEffect(()=>{
    if(publishPostNumber && activePost?.post_id===params.post_id) {
      getComments()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publishPostNumber])

  const getComments = ()=>{
    LocalDB.find({
      selector: {
        table_type: {$in: ['comment', 'post']},
        post_id: params.post_id,
        created_at: {$exists: true},
        $or: [
          {
            refcomment_id: {$exists: false}
          },
          {
            refcomment_id: '0'
          }
        ]
      },
      sort: [{'created_at': 'desc'}],
    })
      .then(res=>{
        let filteredDocs = filterSelfComment(res.docs)
        setIsLoading(false)
        setComments(filteredDocs)
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
          comments.map((comment, _i)=>(
            <Grid item xs={12} key={_i}>
              <CommentCard comment={comment}/>
            </Grid>
          ))
        }
      </Grid>
    </Container>
  );
}

export default Post;
