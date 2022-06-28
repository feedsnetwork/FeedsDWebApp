import { FC, useContext } from 'react';
import { Box, Typography, Stack, Card, Input, Divider, IconButton, Grid, styled } from '@mui/material';

import StyledButton from 'src/components/StyledButton';
import StyledAvatar from 'src/components/StyledAvatar';

interface AccountInfoProps {
  // type?: string;
}
const AccountInfo: FC<AccountInfoProps> = (props)=>{
  return (
    <Box p={4}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={6} alignItems='center'>
          <StyledAvatar alt='asralf' src='/test.png' width={70}/>
          <Grid container direction="column">
            <Grid item>
              <Typography variant='subtitle1'>Name</Typography>
              <Typography variant='body2' color='text.secondary'>asralf</Typography>
              <Divider/>
            </Grid>
            <Grid item py={2}>
              <Typography variant='subtitle1'>DID</Typography>
              <Typography variant='body2' color='text.secondary'>did:elastos:icZdMxZe6U1Exs6TFsKTzj2pY2JLznPhjC</Typography>
              <Divider/>
            </Grid>
            <Grid item>
              <Typography variant='subtitle1'>Wallet Address</Typography>
              <Typography variant='body2' color='text.secondary'>0x3eC00aFc29A5b6cd43b822E896b088A6708887cD</Typography>
              <Divider/>
            </Grid>
          </Grid>
        </Stack>
      </Card>
    </Box>
  );
}

export default AccountInfo;
