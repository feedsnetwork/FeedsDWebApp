import React from 'react'
import { useSelector } from 'react-redux';
import { isString } from 'lodash';
import { Icon } from '@iconify/react';
import { Box, Stack, styled, IconButton, Paper } from '@mui/material';
import { useSnackbar } from 'notistack';
import closeFill from '@iconify/icons-eva/close-fill';

import { SidebarContext } from 'contexts/SidebarContext';
import EmojiPopper from 'components/EmojiPopper'
import StyledButton from 'components/StyledButton';
import StyledIconButton from 'components/StyledIconButton';
import StyledTextFieldOutline from 'components/StyledTextFieldOutline'
import { PostContentV3, mediaDataV3, MediaType } from 'models/post_content'
import { selectFocusedChannelId } from 'redux/slices/channel';
import { HiveApi } from 'services/HiveApi'
import { getBufferFromFile } from 'utils/common'
import { getLocalDB } from 'utils/db';

const PostBoxStyle = styled(Box)(({ theme }) => ({
  position: 'sticky',
  bottom: 0,
  zIndex: 1,
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  background: 'rgba(22, 28, 36, 0.8)',
  backdropFilter: 'blur(20px)',
}));

function PostBox() {
  const { publishPostNumber, setPublishPostNumber } = React.useContext(SidebarContext);
  const focusedChannelId = useSelector(selectFocusedChannelId)
  const [isOnValidation, setOnValidation] = React.useState(false);
  const [onProgress, setOnProgress] = React.useState(false);
  const [postext, setPostext] = React.useState('');
  const [imageAttach, setImageAttach] = React.useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isOpenPopover, setOpenPopover] = React.useState(false);
  const postRef = React.useRef(null)

  const { enqueueSnackbar } = useSnackbar();
  const hiveApi = new HiveApi()
  const LocalDB = getLocalDB()

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
    hiveApi.publishPost(focusedChannelId.toString(), "", JSON.stringify(postContent))
      .then(res=>{
        // console.log(res, "===============2")
        const newPostObj = {
          channel_id: focusedChannelId.toString(),
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
  return (  
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
            <StyledIconButton icon="clarity:video-gallery-line"/>
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
            <StyledButton fullWidth loading={onProgress} needLoading={true} onClick={handlePost}>Post</StyledButton>
          </Box>
        </Stack>
      </Stack>
      <EmojiPopper {...{anchorEl, isOpenPopover, setOpenPopover, onEmojiClick}}/>
    </PostBoxStyle>
  )
}

export default PostBox;
