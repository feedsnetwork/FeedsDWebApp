import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isString } from 'lodash';
import { Dialog, DialogTitle, DialogContent, Typography, Box, Stack, IconButton, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';
import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';

import StyledAvatar from '../StyledAvatar';
import StyledButton from '../StyledButton';
import StyledTextFieldOutline from '../StyledTextFieldOutline'
import StyledIconButton from '../StyledIconButton';
import EmojiPopper from '../EmojiPopper';
import { SidebarContext } from 'contexts/SidebarContext';
import { PostContentV3, mediaDataV3, MediaType } from 'models/post_content'
import { HiveApi } from 'services/HiveApi'
import { CommonStatus } from 'models/common_content'
import { getBufferFromFile, getImageSource } from 'utils/common'
import { getLocalDB } from 'utils/db';
import { handlePostModal, selectPostModalState, selectActivePost } from 'redux/slices/post';
import { selectActiveChannelId, selectChannelById, selectFocusedChannelId } from 'redux/slices/channel';

function PostDlg() {
  const { publishPostNumber, setPublishPostNumber } = React.useContext(SidebarContext);
  const [isOnValidation, setOnValidation] = React.useState(false);
  const [onProgress, setOnProgress] = React.useState(false);
  const [postext, setPostext] = React.useState('');
  const [imageAttach, setImageAttach] = React.useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isOpenPopover, setOpenPopover] = React.useState(false);
  const postRef = React.useRef(null)

  const dispatch = useDispatch()
  const isOpen = useSelector(selectPostModalState)
  const activeChannelId = useSelector(selectActiveChannelId)
  const focusedChannelId = useSelector(selectFocusedChannelId)
  const activePost = useSelector(selectActivePost)
  
  const currentChannelId = activeChannelId || activePost?.channel_id || focusedChannelId
  const focusedChannel = useSelector(selectChannelById(currentChannelId)) || {}
  const isComment = activePost && !!activePost.comment_id
  const { enqueueSnackbar } = useSnackbar();
  const hiveApi = new HiveApi()
  const LocalDB = getLocalDB()
  
  React.useEffect(()=>{
    if(!isOpen) {
      setOnValidation(false)
      setPostext('')
      setOnProgress(false)
      setImageAttach(null)
    }
  }, [isOpen])

  React.useEffect(()=>{
    if(activePost && isOpen) {
      let contentObj = {content: ''}
      if(activePost && !!activePost.comment_id)
        contentObj.content = activePost.content
      else
        contentObj = JSON.parse(activePost.content)
      setPostext(contentObj.content || '')
      if(activePost.mediaData && activePost.mediaData.length) {
        const tempMedia = activePost.mediaData[0]
        if(tempMedia.kind === 'image') {
          setImageAttach(tempMedia.mediaSrc)
        }
      }
    }
  }, [activePost, isOpen])

  const handlePost = async (e) => {
    setOnValidation(true)
    if(!postext){
      postRef.current.focus()
      return
    }
    setOnProgress(true)
    const postContent = new PostContentV3()
    postContent.content = postext
    let mediaDataArr = []
    if(imageAttach) {
      if(isString(imageAttach)) {
        const contentObj = JSON.parse(activePost.content)
        postContent.mediaData = contentObj.mediaData
        postContent.mediaType = contentObj.mediaType
      } else {
        const imageBuffer = await getBufferFromFile(imageAttach) as Buffer
        const base64content = imageBuffer.toString('base64')
        const attachSrc = `data:${imageAttach.type};base64,${base64content}`
        const imageHivePath = await hiveApi.uploadMediaDataWithString(attachSrc)
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
        mediaDataArr.push({...tempMediaData, mediaSrc: attachSrc})
        postContent.mediaData.push(tempMediaData)
        postContent.mediaType = MediaType.containsImg
      }
    }
    if(activePost) {
      if(!isComment)
        await hiveApi.updatePost(activePost.post_id, currentChannelId.toString(), activePost.type, activePost.tag, JSON.stringify(postContent), CommonStatus.edited, Math.round(new Date().getTime()/1000), activePost.memo, activePost.proof)
      else
        await hiveApi.updateComment(focusedChannel['target_did'], currentChannelId.toString(), activePost.post_id, activePost.comment_id, postContent.content)
      
      // console.log(res, "===============2")
      enqueueSnackbar('Update post success', { variant: 'success' });
      setPublishPostNumber(publishPostNumber+1)
      setOnProgress(false)
      handleClose()
    }
    else
      hiveApi.publishPost(currentChannelId.toString(), "", JSON.stringify(postContent))
        .then(res=>{
          const newPostObj = {
            channel_id: currentChannelId.toString(),
            content: JSON.stringify(postContent),
            created: Math.floor(res.createdAt/1000),
            created_at: res.createdAt,
            is_in_favour: true,
            like_creators: [],
            like_me: false,
            likes: 0,
            mediaData: mediaDataArr,
            memo: "",
            pin_status: 0,
            post_id: res.postId,
            proof: "",
            status: 0,
            table_type: 'post',
            tag: "",
            target_did: res.targetDid,
            type: "public",
            updated_at: res.updatedAt,
            _id: res.postId
          }
          LocalDB.put(newPostObj)
          setPublishPostNumber(publishPostNumber+1)
          enqueueSnackbar('Publish post success', { variant: 'success' });
          setOnProgress(false)
          handleClose()
        })
  }
  const handleUploadClick = (e) => {
    if(!e.target.files.length) {
      setImageAttach(null);
    } else {
      var file = e.target.files[0];
      console.log(file)
      setImageAttach(
        Object.assign(file, {
          preview: URL.createObjectURL(file)
        })
      );
    }
    // const reader = new FileReader();
    // var url = reader.readAsDataURL(file);

    // reader.onloadend = function(e) {
    //   this.setState({
    //     selectedFile: [reader.result]
    //   });
    // }.bind(this);
    // console.log(url); // Would see a path?
  };
  
  const handlePopper = (e)=>{
    setAnchorEl(e.currentTarget)
    setOpenPopover(true)
  }
  const handleImageAttachRemove = (e) => {
    setImageAttach(null);
  };
  const handleChangePostext = (e) => {
    setPostext(e.target.value)
  }
  const onEmojiClick = (emojiObject, _) => {
    setPostext((prev)=>`${prev}${emojiObject.emoji}`);
  };
  const handleClose = () => {
    handlePostModal(false)(dispatch)
  };
  return (
    <Dialog open={isOpen} onClose={handleClose} onClick={(e)=>{e.stopPropagation()}}>
      <DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{minWidth: {sm: 'unset', md: 500}}}>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <StyledAvatar alt={focusedChannel['name']} src={getImageSource(focusedChannel['avatarSrc'])}/>
          <Typography variant="subtitle1">{focusedChannel['name']}</Typography>
        </Stack>
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
                        // bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                        // '&:hover': {
                        //   bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48)
                        // }
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
                id="image-button-file"
                // multiple
                type="file"
                onChange={handleUploadClick}
                style={{display: 'none'}}
              />
              <label htmlFor="image-button-file">
                <StyledIconButton icon="clarity:picture-line"/>
              </label>
              {/* <StyledIconButton icon="clarity:video-gallery-line"/> */}
              <StyledIconButton icon="fluent:emoji-laugh-24-regular" onClick={handlePopper}/>
              {/* <IconButton>
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
              </IconButton> */}
            </Box>
            <Box width={150}>
              <StyledButton fullWidth loading={onProgress} needLoading={true} onClick={handlePost}>{activePost?'Save changes':'Post'}</StyledButton>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
      <EmojiPopper {...{anchorEl, isOpenPopover, setOpenPopover, onEmojiClick}}/>
    </Dialog>
  );
}

export default PostDlg