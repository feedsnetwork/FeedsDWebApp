import React from 'react';
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogTitle, DialogContent, Typography, Box, Stack, Divider, IconButton, Paper } from '@mui/material';
import { Icon } from '@iconify/react';

import StyledButton from '../StyledButton';
import StyledIcon from '../StyledIcon'
import { essentialsConnector, isUsingEssentialsConnector } from 'src/content/signin/EssentialConnectivity';
import { SidebarContext } from 'src/contexts/SidebarContext';
import { isInAppBrowser } from 'src/utils/common'

function SignoutDlg(props) {
  const { setOpen, isOpen } = props;
  const navigate = useNavigate();
  const { setWalletAddress } = React.useContext(SidebarContext);

  const signOutWithEssentials = async () => {
    sessionStorage.removeItem('FEEDS_LINK');
    sessionStorage.removeItem('FEEDS_DID');
    try {
      // setSigninEssentialSuccess(false);
      setWalletAddress(null);
      if (isUsingEssentialsConnector() && essentialsConnector.hasWalletConnectSession())
        await essentialsConnector.disconnectWalletConnect();
      if (isInAppBrowser() && (await window['elastos'].getWeb3Provider().isConnected()))
        await window['elastos'].getWeb3Provider().disconnect();
    } catch (error) {
      console.log('Error while disconnecting the wallet', error);
    }
  };

  const handleAction = async (e) => {
    if(e.currentTarget.value==='ok') {
      await signOutWithEssentials()
      navigate('/')
    } else {
      handleClose()
    }
  }

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogContent sx={{minWidth: {sm: 'unset', md: 500}}}>
        <Stack spacing={2} sx={{textAlign: 'center'}}>
          <Typography variant="h5">Sign Out</Typography>
          <StyledIcon icon="clarity:sign-out-line" width={64} height={64}/>
          <Typography variant="body2">Are you sure you want to sign out?</Typography>
          <Stack direction="row" spacing={3}>
            <StyledButton type="outlined" fullWidth value='cancel' onClick={handleAction}>Cancel</StyledButton>
            <StyledButton fullWidth value='ok' onClick={handleAction}>Yes</StyledButton>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default SignoutDlg