import { Box, Typography, Stack, Card, Divider, Grid, styled } from '@mui/material';

import SwitchUI from 'components/SwitchUI'

const BadgeBox = styled(Box)(({ theme }) => ({
  position: 'absolute', 
  borderRadius: '50%', 
  width: 22, 
  height: 22, 
  background: 'black', 
  textAlign: 'center', 
  right: 0, 
  bottom: 0, 
  display: 'flex', 
  justifyContent: 'center'
}))
const Connections = (props)=>{
  return (
    <Box p={4}>
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Typography variant='body1' color='text.primary'>
            Connect your accounts to unlock special Feeds Network integration
          </Typography>
          <Box>
            <Box sx={{position: 'relative', display: 'inline'}}>
              <Box component="img" src="/twitter.png" sx={{width: 50}}/>
              <BadgeBox>
                <Box component="img" src="/feeds-logo.svg" sx={{width: 14}}/>
              </BadgeBox>
            </Box>
          </Box>
        </Stack>
      </Card>
      <Card sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant='body1' color='text.primary'>
            Please manage your account connections
          </Typography>
          <Grid container direction="column">
            <Grid item>
              <Stack direction='row' alignItems='center'>
                <Box flexGrow={1}>
                  <Typography variant='subtitle1'>Twitter</Typography>
                  <Typography variant='body2' color='text.secondary'>Connected</Typography>
                </Box>
                <SwitchUI/>
              </Stack>
              <Divider sx={{my: 1}}/>
            </Grid>
          </Grid>
        </Stack>
      </Card>
    </Box>
  );
}

export default Connections;
