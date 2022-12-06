import React from 'react';
import { useSelector } from 'react-redux'
import { Box, Typography, Stack, Card, Divider, Grid } from '@mui/material';

import StyledAvatar from 'components/StyledAvatar';
import { SidebarContext } from 'contexts/SidebarContext';
import { selectMyInfo } from 'redux/slices/user';
import { decodeBase64, getImageSource } from 'utils/common';
import { getLocalDB } from 'utils/db';

interface AccountInfoProps {
  // type?: string;
}
const AccountInfo: React.FC<AccountInfoProps> = (props)=>{
  const { walletAddress } = React.useContext(SidebarContext);
  const myInfo = useSelector(selectMyInfo)
  const myAvatarUrl = myInfo['avatar_url']
  const [avatarSrc, setAvatarSrc] = React.useState('');
  const feedsDid = localStorage.getItem('FEEDS_DID')
  const myDID = `did:elastos:${feedsDid}`
  const LocalDB = getLocalDB()

  React.useEffect(()=>{
    if(myAvatarUrl) {
      LocalDB.get(myAvatarUrl)
        .then(doc=>getImageSource(doc['source']))
        .then(setAvatarSrc)
    }
    else
        setAvatarSrc('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myAvatarUrl])

  return (
    <Box p={4}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={6} alignItems='center'>
          <StyledAvatar alt={myInfo['name']} src={avatarSrc} width={70}/>
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
