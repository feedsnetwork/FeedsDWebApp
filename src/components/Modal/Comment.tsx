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
import { SidebarContext } from 'src/contexts/SidebarContext';
import { PostContentV3, mediaDataV3, MediaType } from 'src/models/post_content'
import PostBody from '../PostCard/PostBody'
import { HiveApi } from 'src/services/HiveApi'
import { getBufferFromFile, reduceDIDstring } from 'src/utils/common'

function CommentDlg(props) {
  const { post, postProps, setOpen, isOpen } = props;
  const { focusedChannelId, selfChannels, subscribedChannels, publishPostNumber, userInfo, setPublishPostNumber } = React.useContext(SidebarContext);
  const [isOnValidation, setOnValidation] = React.useState(false);
  const [onProgress, setOnProgress] = React.useState(false);
  const [commentext, setCommentext] = React.useState('');
  
  const focusedChannel = selfChannels.find(item=>item.channel_id==focusedChannelId) || {}
  const { enqueueSnackbar } = useSnackbar();
  const hiveApi = new HiveApi()
  const commentRef = React.useRef(null)
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const currentChannel = [...selfChannels, ...subscribedChannels].find(item=>item.channel_id==post.channel_id) || {}
  
  React.useEffect(()=>{
    if(!isOpen) {
      setOnValidation(false)
      setCommentext('')
      setOnProgress(false)
    }
  }, [isOpen])

  const handlePost = async (e) => {
    setOnValidation(true)
    if(!commentext){
      commentRef.current.focus()
      return
    }
    setOnProgress(true)
    hiveApi.createComment(currentChannel.target_did, currentChannel.channel_id, post.post_id, '0', commentext)
      .then(res=>{
        // console.log(res, "===============2")
        enqueueSnackbar('Reply comment success', { variant: 'success' });
        setPublishPostNumber(publishPostNumber+1)
        setOnProgress(false)
        setOpen(false);
      })
  }
  const handleChangecommentext = (e) => {
    setCommentext(e.target.value)
  }
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
        <PostBody {...postProps}/>
        <Stack direction="row" spacing={1} alignItems="center" mb={2} mt={2}>
          <StyledAvatar alt={focusedChannel.name} src={focusedChannel.avatarSrc} width={40}/>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {userInfo['name'] || reduceDIDstring(feedsDid)}
            </Typography>
            <Typography variant="body2" noWrap>
              <b>Replying to</b> {postProps.contentObj.secondaryName}
            </Typography>
          </Box>
        </Stack>
        <Stack spacing={2}>
          <StyledTextFieldOutline
            inputRef={commentRef}
            value={commentext}
            multiline
            rows={3}
            placeholder="What are you thoughts?"
            onChange={handleChangecommentext}
            error={isOnValidation&&!commentext}
            helperText={isOnValidation&&!commentext?'Message is required':''}
          />
          <Stack direction='row' sx={{justifyContent: 'end'}}>
            <Box width={150}>
              <StyledButton fullWidth loading={onProgress} needLoading={true} onClick={handlePost}>Reply</StyledButton>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

CommentDlg.propTypes = {
  setOpen: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  post: PropTypes.object.isRequired,
  postProps: PropTypes.object.isRequired,
};

export default CommentDlg