import React from 'react';
import { Box, Typography, Stack, Card, Divider, Grid } from '@mui/material';

import StyledAvatar from 'components/StyledAvatar';
import { SidebarContext } from 'contexts/SidebarContext';
import { HiveApi } from 'services/HiveApi'
import { getInfoFromDID } from 'utils/common'

interface AccountInfoProps {
  // type?: string;
}
const AccountInfo: React.FC<AccountInfoProps> = (props)=>{
  const { walletAddress } = React.useContext(SidebarContext);
  const [avatarSrc, setAvatarSrc] = React.useState('')
  const [userInfo, setUserInfo] = React.useState({})
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const userDid = `did:elastos:${feedsDid}`
  const hiveApi = new HiveApi()

  React.useEffect(()=>{
    if(!feedsDid)
      return
      
    hiveApi.getHiveUrl(userDid)
      .then(hiveUrl=>hiveApi.downloadFileByHiveUrl(userDid, hiveUrl))
      .then(res=>{
        const resBuf = res as Buffer
        if(resBuf && resBuf.length) {
          const base64Content = resBuf.toString('base64')
          setAvatarSrc(`data:image/png;base64,${base64Content}`)
        }
      })
      .catch(err=>{})
      
    getInfoFromDID(userDid).then(res=>{
      setUserInfo(res)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box p={4}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={6} alignItems='center'>
          <StyledAvatar alt={userInfo['name']} src={avatarSrc} width={70}/>
          <Grid container direction="column">
            <Grid item>
              <Typography variant='subtitle1'>Name</Typography>
              <Typography variant='body2' color='text.secondary'>{userInfo['name']}</Typography>
              <Divider/>
            </Grid>
            <Grid item py={2}>
              <Typography variant='subtitle1'>DID</Typography>
              <Typography variant='body2' color='text.secondary'>{userDid}</Typography>
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
