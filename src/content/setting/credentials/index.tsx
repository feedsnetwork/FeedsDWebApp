import { FC, useContext } from 'react';
import { Box, Typography, Stack, Card, Input, Divider, IconButton, Grid, Link, styled } from '@mui/material';
import { Icon } from '@iconify/react';

import StyledButton from 'src/components/StyledButton';
import SwitchUI from 'src/components/SwitchUI'

const credentialItems = [
  {title: 'Avatar', description: 'avatar', id: 'avatar'},
  {title: 'Name', description: 'name', id: 'name'},
  {title: 'Description', description: 'description', id: 'description'},
  {title: 'Website', description: 'website', id: 'website'},
  {title: 'Pasar', description: 'Pasar account', id: 'pasar'},
  {title: 'Twitter', description: 'Twitter account', id: 'twitter'},
  {title: 'Discord', description: 'Discord account', id: 'discord'},
  {title: 'Telegram', description: 'Telegram account', id: 'telegram'},
  {title: 'Medium', description: 'Medium account', id: 'medium'},
  {title: 'KYC-me', description: 'KYC-me badge', id: 'KYC'},
]

interface CredentialsProps {
  // type?: string;
}
const Credentials: FC<CredentialsProps> = (props)=>{
  return (
    <Box p={4}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={2} alignItems='center'>
          <Typography variant='body1' color='text.primary'>
            We do not store you personal information. Therefore, please choose your credentials from DID to display them on your public profile.
          </Typography>
          <Grid container direction="column">
            {
              credentialItems.map((item, _i)=>(
                <Grid item key={_i}>
                  <Stack direction='row' alignItems='center'>
                    <Box flexGrow={1}>
                      <Typography variant='subtitle1'>{item.title}</Typography>
                      <Typography variant='body2' color='text.secondary'>Display {item.description}</Typography>
                    </Box>
                    <SwitchUI/>
                  </Stack>
                  <Divider sx={{my: 1}}/>
                </Grid>
              ))
            }
            <Grid item>
              <Link href='http://kyc-me.io' target="_blank" sx={{display: 'flex', alignItems: 'center', color: 'text.primary'}}>
                <Typography variant="body2" sx={{color: 'origin.main'}}>
                  No such credentials yet? Get credentials on KYC-me.io now!
                </Typography>&nbsp;
                <Icon icon='line-md:external-link' width="18px"/>
              </Link>
            </Grid>
          </Grid>
          <Box width={200}>
            <StyledButton fullWidth>Save Credentials</StyledButton>
          </Box>
        </Stack>
      </Card>
    </Box>
  );
}

export default Credentials;
