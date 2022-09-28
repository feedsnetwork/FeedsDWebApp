import React from 'react';
import { isString } from 'lodash';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, Typography, Box, Stack, Divider, IconButton, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';
import closeFill from '@iconify/icons-eva/close-fill';
import { Icon } from '@iconify/react';

import StyledAvatar from '../StyledAvatar';
import StyledButton from '../StyledButton';
import StyledTextFieldOutline from '../StyledTextFieldOutline'
import StyledIconButton from '../StyledIconButton';
import EmojiPopper from '../EmojiPopper';
import { SidebarContext } from 'src/contexts/SidebarContext';
import { PostContentV3, mediaDataV3, MediaType } from 'src/models/post_content'
import { HiveApi } from 'src/services/HiveApi'
import { CommonStatus } from 'src/models/common_content'
import { getBufferFromFile, getMergedArray } from 'src/utils/common'

function PostDlg(props) {
  const { setOpen, isOpen, activeChannelId=null, activePost=null } = props;
  const { focusedChannelId, selfChannels, publishPostNumber, setPublishPostNumber } = React.useContext(SidebarContext);
  const [isOnValidation, setOnValidation] = React.useState(false);
  const [onProgress, setOnProgress] = React.useState(false);
  const [postext, setPostext] = React.useState('');
  const [imageAttach, setImageAttach] = React.useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isOpenPopover, setOpenPopover] = React.useState(false);
  
  const currentChannelId = activeChannelId || activePost?activePost.channel_id:null || focusedChannelId
  const focusedChannel = selfChannels.find(item=>item.channel_id==currentChannelId) || {}
  const { enqueueSnackbar } = useSnackbar();
  const hiveApi = new HiveApi()
  const postRef = React.useRef(null)
  
  React.useEffect(()=>{
    if(!isOpen) {
      setOnValidation(false)
      setPostext('')
      setOnProgress(false)
    }
  }, [isOpen])

  React.useEffect(()=>{
    if(activePost && isOpen) {
      let contentObj = {content: ''}
      contentObj = JSON.parse(activePost.content)
      setPostext(contentObj.content || '')
      if(activePost.mediaData && activePost.mediaData.length) {
        const tempMedia = activePost.mediaData[0]
        if(tempMedia.kind == 'image') {
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
    if(imageAttach) {
      if(isString(imageAttach)) {
        const contentObj = JSON.parse(activePost.content)
        postContent.mediaData = contentObj.mediaData
        postContent.mediaType = contentObj.mediaType
      } else {
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
    }
    if(activePost)
      hiveApi.updatePost(activePost.post_id, currentChannelId.toString(), activePost.type, activePost.tag, JSON.stringify(postContent), CommonStatus.edited, Math.round(new Date().getTime()/1000), activePost.memo, activePost.proof)
        .then(res=>{
          // console.log(res, "===============2")
          enqueueSnackbar('Update post success', { variant: 'success' });
          setPublishPostNumber(publishPostNumber+1)
          setOnProgress(false)
          setOpen(false);
        })
    else
      hiveApi.publishPost(currentChannelId.toString(), "", JSON.stringify(postContent))
        .then(res=>{
          // console.log(res, "===============2")
          enqueueSnackbar('Publish post success', { variant: 'success' });
          setPublishPostNumber(publishPostNumber+1)
          setOnProgress(false)
          setOpen(false);
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
    // const reader = new FileReader();
    // var url = reader.readAsDataURL(file);

    // reader.onloadend = function(e) {
    //   this.setState({
    //     selectedFile: [reader.result]
    //   });
    // }.bind(this);
    // console.log(url); // Would see a path?

    // this.setState({
    //   mainState: "uploaded",
    //   selectedFile: e.target.files[0],
    //   imageUploaded: 1
    // });
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
  const handleClose = (e) => {
    e.stopPropagation()
    setOpen(false);
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
          <StyledAvatar alt={focusedChannel.name} src={focusedChannel.avatarSrc}/>
          <Typography variant="subtitle1">{focusedChannel.name}</Typography>
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
      </DialogContent>
      <EmojiPopper {...{anchorEl, isOpenPopover, setOpenPopover, onEmojiClick}}/>
    </Dialog>
  );
}

export default PostDlg