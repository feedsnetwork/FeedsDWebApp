import React from 'react';
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogTitle, DialogContent, Typography, Box, Stack, Divider, IconButton, Paper } from '@mui/material';
import { useSnackbar } from 'notistack';

import StyledButton from '../StyledButton';
import StyledIcon from '../StyledIcon'
import { HiveApi } from 'src/services/HiveApi'

function DeletePost(props) {
  const { setOpen, isOpen, post } = props;
  const { post_id, channel_id } = post
  const [onProgress, setOnProgress] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const hiveApi = new HiveApi()

  React.useEffect(()=>{
    if(!isOpen) {
      setOnProgress(false)
    }
  }, [isOpen])

  const handleAction = async (e) => {
    if(e.currentTarget.value === 'ok') {
      setOnProgress(true)
      hiveApi.deletePost(post_id, channel_id)
        .then(_=>{
          enqueueSnackbar('Delete post success', { variant: 'success' });
          setOnProgress(false)
          handleClose()
        })
        .catch(err=>{
          enqueueSnackbar('Delete post error', { variant: 'error' });
        })
    } else {
      handleClose()
    }
  }

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} onClick={(e)=>{e.stopPropagation()}}>
      <DialogContent sx={{minWidth: {sm: 'unset', md: 400}}}>
        <Stack spacing={2} sx={{textAlign: 'center'}}>
          <Typography variant="h5">Delete Post</Typography>
          <StyledIcon icon="fa6-solid:trash-can" width={64} height={64}/>
          <Typography variant="body2">Are you sure you want to delete this post?</Typography>
          <Stack direction="row" spacing={3}>
            <StyledButton type="outlined" fullWidth value='cancel' onClick={handleAction}>Cancel</StyledButton>
            <StyledButton fullWidth loading={onProgress} needLoading={true} value='ok' onClick={handleAction}>Yes</StyledButton>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default DeletePost