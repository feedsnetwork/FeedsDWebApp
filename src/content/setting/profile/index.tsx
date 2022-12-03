import React from 'react';
import { useSelector } from 'react-redux'
import { Box, Typography, Stack, Card, Divider, Grid } from '@mui/material';

import StyledAvatar from 'components/StyledAvatar';
import { SidebarContext } from 'contexts/SidebarContext';
import { selectMyInfo } from 'redux/slices/user';
import { decodeBase64 } from 'utils/common';

interface AccountInfoProps {
  // type?: string;
}
const AccountInfo: React.FC<AccountInfoProps> = (props)=>{
  const { walletAddress } = React.useContext(SidebarContext);
  const myInfo = useSelector(selectMyInfo)
  const feedsDid = localStorage.getItem('FEEDS_DID')
  const myDID = `did:elastos:${feedsDid}`

  return (
    <Box p={4}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={6} alignItems='center'>
          <StyledAvatar alt={myInfo['name']} src={decodeBase64(myInfo['avatarSrc'])} width={70}/>
          <Grid container direction="column">
            <Grid item>
              <Typography variant='subtitle1'>Name</Typography>
              <Typography variant='body2' color='text.secondary'>{myInfo['name']}</Typography>
              <Divider/>
            </Grid>
            <Grid item py={2}>
              <Typography variant='subtitle1'>DID</Typography>
              <Typography variant='body2' color='text.secondary'>{myDID}</Typography>
              <Divider/>
            </Grid>
            <Grid item>
              <Typography variant='subtitle1'>Wallet Address</Typography>
              <Typography variant='body2' color='text.secondary'>{walletAddress}</Typography>
              <Divider/>
            </Grid>
          </Grid>
        </Stack>
      </Card>
    </Box>
  );
}

export default AccountInfo;
