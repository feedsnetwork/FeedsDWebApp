import { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, Typography, Box, Stack, Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StyledAvatar from '../StyledAvatar';
import StyledButton from '../StyledButton';
import StyledTextFieldOutline from '../StyledTextFieldOutline'
import StyledIconButton from '../StyledIconButton';

function PostDlg(props) {
  const { setOpen, isOpen } = props;

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
          <StyledAvatar alt='Elastos' src='/static/images/avatars/2.jpg'/>
          <Typography variant="subtitle1">
            MMA Lover
          </Typography>
        </Stack>
        <Stack spacing={2}>
          <StyledTextFieldOutline
            multiline
            rows={3}
            placeholder="What's up"
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
              <StyledButton fullWidth>Post</StyledButton>
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