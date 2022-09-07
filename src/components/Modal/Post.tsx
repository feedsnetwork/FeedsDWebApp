import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, Typography, Box, Stack, Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';

import StyledAvatar from '../StyledAvatar';
import StyledButton from '../StyledButton';
import StyledTextFieldOutline from '../StyledTextFieldOutline'
import StyledIconButton from '../StyledIconButton';
import { SidebarContext } from 'src/contexts/SidebarContext';
import { PostContentV3 } from 'src/models/post_content'
import { HiveApi } from 'src/services/HiveApi'

function PostDlg(props) {
  const { setOpen, isOpen } = props;
  const { focusedChannelId, selfChannels } = React.useContext(SidebarContext);
  const [isOnValidation, setOnValidation] = React.useState(false);
  const [postext, setPostext] = React.useState('');
  const focusedChannel = selfChannels.find(item=>item.channel_id==focusedChannelId) || {}
  const { enqueueSnackbar } = useSnackbar();
  const hiveApi = new HiveApi()
  const postRef = React.useRef(null)
  
  const handlePost = (e) => {
    setOnValidation(true)
    if(!postext){
      postRef.current.focus()
      return
    }
    const postContent = new PostContentV3()
    postContent.content = postext
    hiveApi.publishPost(focusedChannelId.toString(), "", JSON.stringify(postContent))
      .then(res=>{
        // console.log(res, "===============2")
        enqueueSnackbar('Publish post success', { variant: 'success' });
      })
  }
  
  const handleChangePostext = (e) => {
    setPostext(e.target.value)
  }
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
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
            rows={3}
            placeholder="What's up"
            onChange={handleChangePostext}
            error={isOnValidation&&!postext}
            helperText={isOnValidation&&!postext?'Description is required':''}
          />
          <Stack direction='row'>
            <Box sx={{ alignItems: 'center', display: 'flex', flexGrow: 1 }}>
              <StyledIconButton icon="clarity:picture-line"/>
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
              <StyledButton fullWidth onClick={handlePost}>Post</StyledButton>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

PostDlg.propTypes = {
  setOpen: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

export default PostDlg