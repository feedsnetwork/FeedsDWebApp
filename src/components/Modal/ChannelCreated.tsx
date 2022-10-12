import React from 'react';
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Dialog, DialogTitle, DialogContent, Typography, Box, Stack } from '@mui/material';

import StyledButton from '../StyledButton';
import StyledIcon from '../StyledIcon'
import { selectSuccessModalState, handleSuccessModal, handlePublishModal } from 'redux/slices/channel'

function ChannelCreated() {
  const isOpen = useSelector(selectSuccessModalState)
  const dispatch = useDispatch()
  const handleAction = async (e) => {
    if(e.currentTarget.value==='ok') {
      handlePublishModal(true)(dispatch)
    }
    handleClose()
  }

  const handleClose = () => {
    handleSuccessModal(false)(dispatch);
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogContent sx={{minWidth: {sm: 'unset', md: 500}}}>
        <Stack spacing={2} sx={{textAlign: 'center'}}>
          <Typography variant="h5">Channel Created!</Typography>
          <StyledIcon icon="bi:check-circle" width={64} height={64}/>
          <Typography variant="body2">
            You have created a new channel!<br/>
            Do you want to make this channel public for other users to discover?<br/>
            You can also publish anytime by accessing the channel preferences.
          </Typography>
          <Stack direction="row" spacing={3}>
            <StyledButton type="outlined" fullWidth value='cancel' onClick={handleAction}>I’ll do it later</StyledButton>
            <StyledButton fullWidth value='ok' onClick={handleAction}>Let’s do it!</StyledButton>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default ChannelCreated