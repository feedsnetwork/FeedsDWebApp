import React from 'react'
import { isString } from 'lodash';
import { Icon } from '@iconify/react';
import { Grid, Container, Box, Typography, Stack, styled, IconButton, Paper } from '@mui/material';
import { useSnackbar } from 'notistack';
import closeFill from '@iconify/icons-eva/close-fill';

import PostCard from 'src/components/PostCard';
import { EmptyView } from 'src/components/EmptyView'
import { SidebarContext } from 'src/contexts/SidebarContext';
import StyledButton from 'src/components/StyledButton';
import StyledIconButton from 'src/components/StyledIconButton';
import StyledTextFieldOutline from 'src/components/StyledTextFieldOutline'
import PostSkeleton from 'src/components/Skeleton/PostSkeleton'
import { PostContentV3, mediaDataV3, MediaType } from 'src/models/post_content'
import { reduceDIDstring, getAppPreference, sortByDate, getBufferFromFile } from 'src/utils/common'
import { HiveApi } from 'src/services/HiveApi'

const PostBoxStyle = styled(Box)(({ theme }) => ({
  position: 'sticky',
  bottom: 0,
  zIndex: 1,
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  background: 'rgba(22, 28, 36, 0.8)',
  backdropFilter: 'blur(20px)',
}));

function Channel() {
  const { focusedChannelId, selfChannels, publishPostNumber, setPublishPostNumber } = React.useContext(SidebarContext);
  const [posts, setPosts] = React.useState([])
  const [dispName, setDispName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false)
  const [isOnValidation, setOnValidation] = React.useState(false);
  const [onProgress, setOnProgress] = React.useState(false);
  const [postext, setPostext] = React.useState('');
  const [imageAttach, setImageAttach] = React.useState(null);

  const { enqueueSnackbar } = useSnackbar();
  const prefConf = getAppPreference()
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const userDid = `did:elastos:${feedsDid}`
  const hiveApi = new HiveApi()
  const postRef = React.useRef(null)
  const focusedChannel = selfChannels.find(item=>item.channel_id==focusedChannelId)

  React.useEffect(()=>{
    if(focusedChannelId) {
      // const postContent = new PostContentV3()
      // postContent.content = "This is new post"
      // hiveApi.updatePost("4d273607cd54b4850c086ecffd1b059aa7332b35e3c8a153b4d8178f4aa045fc", "396968a639f20908bbe51cba84f14f02620466fc6a103b2c277cc80b3ab22504", "public", "", JSON.stringify(postContent), 0, 1662041339625, "", "")
      //   .then(res=>{console.log(res, '%%%%%%%%%%%%%%%%%%%%%%%%')})
      setIsLoading(true)
      hiveApi.queryUserDisplayName(userDid, focusedChannelId.toString(), userDid)
        .then(res=>{
          if(res['find_message'])
            setDispName(res['find_message']['items'][0].display_name)
        })
      hiveApi.querySelfPostsByChannel(focusedChannelId.toString())
        .then(res=>{
          if(Array.isArray(res)) {
            const postArr = prefConf.DP?
              res:
              res.filter(item=>!item.status)

            postArr.forEach(post=>{
              const contentObj = JSON.parse(post.content)
              contentObj.mediaData.forEach((media, _i)=>{
                if(!media.originMediaPath)
                  return
                hiveApi.downloadScripting(focusedChannel.target_did, media.originMediaPath)
                  .then(downloadRes=>{
                    if(downloadRes) {
                      setPosts(prev=>{
                        const prevState = [...prev]
                        const postIndex = prevState.findIndex(el=>el.post_id==post.post_id)
                        if(postIndex<0)
                          return prevState
                        if(prevState[postIndex].mediaData)
                          prevState[postIndex].mediaData.push({...media, mediaSrc: downloadRes})
                        else
                          prevState[postIndex].mediaData = [{...media, mediaSrc: downloadRes}]
                        return prevState
                      })
                    }
                  })
                  .catch(err=>{
                    console.log(err)
                  })
              })
              hiveApi.queryLikeByPost(focusedChannel.target_did, focusedChannel.channel_id, post.post_id)
                .then(likeRes=>{
                  if(likeRes['find_message'] && likeRes['find_message']['items']) {
                    const likeArr = likeRes['find_message']['items']
                    console.log(likeArr, "++++++++++++++++++12")
                    const likeIndexByMe = likeArr.findIndex(item=>item.creater_did==userDid)
                    setPosts(prev=>{
                      const prevState = [...prev]
                      const postIndex = prevState.findIndex(el=>el.post_id==post.post_id)
                      if(postIndex<0)
                        return prevState
                      prevState[postIndex].likes = likeArr.length
                      prevState[postIndex].like_me = likeIndexByMe>=0
                      return prevState
                    })
                  }
                  // console.log(likeRes, "--------------5")
                })
            })
            const postIds = postArr.map(post=>post.post_id)
            hiveApi.queryCommentsFromPosts(focusedChannel.target_did, focusedChannel.channel_id, postIds)
              .then(commentRes=>{
                if(commentRes['find_message'] && commentRes['find_message']['items']) {
                  const commentArr = commentRes['find_message']['items']
                  const ascCommentArr = sortByDate(commentArr, 'asc')
                  const linkedComments = ascCommentArr.reduce((res, item)=>{
                    if(item.refcomment_id == '0') {
                        res.push(item)
                        return res
                    }
                    const tempRefIndex = res.findIndex((c) => c.comment_id == item.refcomment_id)
                    if(tempRefIndex<0){
                        res.push(item)
                        return res
                    }
                    if(res[tempRefIndex]['commentData'])
                        res[tempRefIndex]['commentData'].push(item)
                    else res[tempRefIndex]['commentData'] = [item]
                    return res
                  }, []).reverse()
                
                  linkedComments.forEach(comment=>{
                    setPosts(prev=>{
                      const prevState = [...prev]
                      const postIndex = prevState.findIndex(el=>el.post_id==comment.post_id)
                      if(postIndex<0)
                        return prevState
                      if(prevState[postIndex].commentData)
                        prevState[postIndex].commentData.push(comment)
                      else
                        prevState[postIndex].commentData = [comment]
                      return prevState
                    })
                  })
                }
                // console.log(commentRes, "--------------6")
              })
            setIsLoading(false)
            setPosts((prevState)=>sortByDate([...prevState, ...postArr]))
          }
        })
    }
  }, [focusedChannelId, publishPostNumber])

  const handlePost = async (e) => {
    setOnValidation(true)
    if(!postext){
      postRef.current.focus()
      return
    }
    setOnProgress(true)
    const postContent = new PostContentV3()
    postContent.content = postext
    if(imageAttach) {
      const imageBuffer = await getBufferFromFile(imageAttach) as Buffer
      const base64content = imageBuffer.toString('base64')
      const imageHivePath = await hiveApi.uploadMediaDataWithString(`data:${imageAttach.type};base64,${base64content}`)
      const tempMediaData: mediaDataV3 = {
        kind: 'image',
        originMediaPath: imageHivePath,
        type: imageAttach.type,
        size: imageAttach.size,
        thumbnailPath: imageHivePath,
        duration: 0,
        imageIndex: 0,
        additionalInfo: null,
        memo: null
      }
      postContent.mediaData.push(tempMediaData)
      postContent.mediaType = MediaType.containsImg
    }
    hiveApi.publishPost(focusedChannelId.toString(), "", JSON.stringify(postContent))
      .then(res=>{
        // console.log(res, "===============2")
        enqueueSnackbar('Publish post success', { variant: 'success' });
        setPublishPostNumber(publishPostNumber+1)
        setOnProgress(false)
        setOnValidation(false)
        setPostext('')
        setImageAttach(null)
      })
  }
  
  const handleUploadClick = (e) => {
    var file = e.target.files[0];
    console.log(file)
    setImageAttach(
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    );
  }
  const handleImageAttachRemove = (e) => {
    setImageAttach(null);
  };
  const handleChangePostext = (e) => {
    setPostext(e.target.value)
  }

  const loadingSkeletons = Array(5).fill(null)
  return (
    <>
      {
        !selfChannels.length?
        <EmptyView type='channel'/>:

        <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
          <Container sx={{ mt: 3, flexGrow: 1, overFlow: 'auto' }} maxWidth={false}>
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

                posts.map((post, _i)=>(
                  <Grid item xs={12} key={_i}>
                    <PostCard post={post} dispName={dispName || reduceDIDstring(feedsDid)}/>
                  </Grid>
                ))
              }
            </Grid>
          </Container>
          <PostBoxStyle>
            <Stack spacing={2}>
              <StyledTextFieldOutline
                inputRef={postRef}
                value={postext}
                multiline
                rows={3}
                placeholder="What's up"
                onChange={handleChangePostext}
                error={isOnValidation&&!postext}
                helperText={isOnValidation&&!postext?'Message is required':''}
              />
              {
                !!imageAttach && 
                <Stack>
                  {
                    !!imageAttach &&
                    <Box sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 1,
                      overflow: 'hidden',
                      position: 'relative',
                      display: 'inline-flex'
                    }}>
                      <Paper
                        variant="outlined"
                        component="img"
                        src={isString(imageAttach) ? imageAttach : imageAttach.preview}
                        sx={{ width: '100%', height: '100%', objectFit: 'fill', position: 'absolute' }}
                      />
                      <Box sx={{ top: 6, right: 6, position: 'absolute' }}>
                        <IconButton
                          size="small"
                          onClick={handleImageAttachRemove}
                          sx={{
                            p: '2px',
                            color: 'common.white',
                          }}
                        >
                          <Icon icon={closeFill} />
                        </IconButton>
                      </Box>
                    </Box>
                  }
                </Stack>
              }
              <Stack direction='row'>
                <Box sx={{ alignItems: 'center', display: 'flex', flexGrow: 1 }}>
                  <input
                    accept="image/*"
                    id="contained-button-file"
                    // multiple
                    type="file"
                    onChange={handleUploadClick}
                    style={{display: 'none'}}
                  />
                  <label htmlFor="contained-button-file">
                    <StyledIconButton icon="clarity:picture-line"/>
                  </label>
                  <StyledIconButton icon="clarity:camera-line"/>
                  <StyledIconButton icon="clarity:video-gallery-line"/>
                  <StyledIconButton icon="clarity:video-camera-line"/>
                  <IconButton>
                    <Typography variant='body2' sx={{
                      backgroundImage: 'linear-gradient(90deg, #7624FE 0%, #368BFF 100%)',
                      backgroundSize: '100%',
                      backgroundRepeat: 'repeat',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      MozBackgroundClip: 'text',
                      MozTextFillColor: 'transparent',
                    }}>
                      NFT
                    </Typography>
                  </IconButton>
                </Box>
                <Box width={150}>
                  <StyledButton fullWidth loading={onProgress} needLoading={true} onClick={handlePost}>Post</StyledButton>
                </Box>
              </Stack>
            </Stack>
          </PostBoxStyle>
        </Box>
      }
    </>
  );
}

export default Channel;
