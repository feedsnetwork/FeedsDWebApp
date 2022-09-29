import React from 'react'
import { isString } from 'lodash';
import { Icon } from '@iconify/react';
import InfiniteScroll from "react-infinite-scroll-component";
import { Grid, Container, Box, Typography, Stack, styled, IconButton, Paper } from '@mui/material';
import { useSnackbar } from 'notistack';
import closeFill from '@iconify/icons-eva/close-fill';

import PostCard from 'src/components/PostCard';
import { EmptyView } from 'src/components/EmptyView'
import { SidebarContext } from 'src/contexts/SidebarContext';
import EmojiPopper from 'src/components/EmojiPopper'
import StyledButton from 'src/components/StyledButton';
import StyledIconButton from 'src/components/StyledIconButton';
import StyledTextFieldOutline from 'src/components/StyledTextFieldOutline'
import PostSkeleton from 'src/components/Skeleton/PostSkeleton'
import { PostContentV3, mediaDataV3, MediaType } from 'src/models/post_content'
import { CommonStatus } from 'src/models/common_content'
import { reduceDIDstring, getAppPreference, sortByDate, getBufferFromFile, getFilteredArrayByUnique } from 'src/utils/common'
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
  const { focusedChannelId, selfChannels, postsInSelf, publishPostNumber, setPublishPostNumber } = React.useContext(SidebarContext);
  const [dispName, setDispName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false)
  const [isOnValidation, setOnValidation] = React.useState(false);
  const [onProgress, setOnProgress] = React.useState(false);
  const [postext, setPostext] = React.useState('');
  const [imageAttach, setImageAttach] = React.useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isOpenPopover, setOpenPopover] = React.useState(false);
  const [dispLength, setDispLength] = React.useState(5);

  const { enqueueSnackbar } = useSnackbar();
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const userDid = `did:elastos:${feedsDid}`
  const hiveApi = new HiveApi()
  const postRef = React.useRef(null)
  const focusedChannel = selfChannels.find(item=>item.channel_id==focusedChannelId)
  const postsInFocusedChannel = postsInSelf[focusedChannelId] || []

  React.useEffect(()=>{
    if(focusedChannelId) {
      // const postContent = new PostContentV3()
      // postContent.content = "This is new post"
      // hiveApi.updatePost("4d273607cd54b4850c086ecffd1b059aa7332b35e3c8a153b4d8178f4aa045fc", "396968a639f20908bbe51cba84f14f02620466fc6a103b2c277cc80b3ab22504", "public", "", JSON.stringify(postContent), 0, 1662041339625, "", "")
      //   .then(res=>{console.log(res, '%%%%%%%%%%%%%%%%%%%%%%%%')})
      if(!postsInSelf[focusedChannelId])
        setIsLoading(true)
      else
        setIsLoading(false)
      hiveApi.queryUserDisplayName(userDid, focusedChannelId.toString(), userDid)
        .then(res=>{
          if(res['find_message'] && res['find_message']['items'].length)
            setDispName(res['find_message']['items'][0].display_name)
        })
    }
  }, [focusedChannelId, publishPostNumber, postsInSelf])

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
  const handlePopper = (e)=>{
    setAnchorEl(e.currentTarget)
    setOpenPopover(true)
  }
  const onEmojiClick = (emojiObject, _) => {
    setPostext((prev)=>`${prev}${emojiObject.emoji}`);
  };
  const appendMoreData = () => {
    setDispLength(dispLength+5)
  }
  const loadingSkeletons = Array(5).fill(null)
  return (
    <>
      {
        !selfChannels.length?
        <EmptyView type='channel'/>:

        <>
          {
            !isLoading && !postsInFocusedChannel.length?
            <EmptyView type='post'/>:
            
            <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
              <Container sx={{ mt: 3, flexGrow: 1 }} maxWidth="lg">
                <InfiniteScroll
                  dataLength={Math.min(postsInFocusedChannel.length, dispLength)}
                  next={appendMoreData}
                  hasMore={dispLength<postsInFocusedChannel.length}
                  loader={<h4>Loading...</h4>}
                  scrollableTarget="scrollableBox"
                  style={{overflow: 'visible'}}
                >
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

                      postsInFocusedChannel.slice(0, dispLength).map((post, _i)=>(
                        <Grid item xs={12} key={_i}>
                          <PostCard post={post} dispName={dispName || reduceDIDstring(feedsDid)}/>
                        </Grid>
                      ))
                    }
                  </Grid>
                </InfiniteScroll>
              </Container>
              <PostBoxStyle>
                <Stack spacing={2}>
                  <StyledTextFieldOutline
                    inputRef={postRef}
                    value={postext}
                    multiline
                    minRows={3}
                    maxRows={10}
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
                      <StyledIconButton icon="fluent:emoji-laugh-24-regular" onClick={handlePopper}/>
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
                <EmojiPopper {...{anchorEl, isOpenPopover, setOpenPopover, onEmojiClick}}/>
              </PostBoxStyle>
            </Box>
          }
        </>
      }
    </>
  );
}

export default Channel;
