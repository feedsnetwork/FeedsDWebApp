import { FC } from 'react';
import { Box, Typography, Stack, Card, Divider, Grid, Link } from '@mui/material';
import { Icon } from '@iconify/react';

import StyledButton from 'components/StyledButton';
import SwitchUI from 'components/SwitchUI'

const credentialItems = [
  {title: 'Avatar', description: 'avatar', id: 'avatar', icon: {name: 'clarity:user-solid'}},
  {title: 'Name', description: 'name', id: 'name', icon: {name: 'gridicons:nametag'}},
  {title: 'Description', description: 'description', id: 'description', icon: {name: 'fluent:text-description-24-filled'}},
  {title: 'Website', description: 'website', id: 'website', icon: {name: 'pajamas:earth'}},
  {title: 'Pasar', description: 'Pasar account', id: 'pasar', icon: {name: '/static/icons/pasar-badge.svg', type: 'image'}},
  {title: 'Twitter', description: 'Twitter account', id: 'twitter', icon: {name: 'akar-icons:twitter-fill'}},
  {title: 'Discord', description: 'Discord account', id: 'discord', icon: {name: 'akar-icons:discord-fill'}},
  {title: 'Telegram', description: 'Telegram account', id: 'telegram', icon: {name: 'cib:telegram-plane'}},
  {title: 'Medium', description: 'Medium account', id: 'medium', icon: {name: 'akar-icons:medium-fill'}},
  {title: 'KYC-me', description: 'KYC-me badge', id: 'KYC', icon: {name: '/static/icons/kyc-badge.svg', type: 'image'}},
]

interface CredentialsProps {
  // type?: string;
}
const IconInCircle = (props)=>{
  const {type='icon', name} = props
  return (
    type==='icon'?
    <Box sx={{p: .8, background: (theme)=>theme.palette.primary.main, borderRadius: '50%', display: 'flex', ml: 1, mr: 2, color: '#C4C4C4'}}>
      <Icon icon={name} width={20} height={20}/>
    </Box>:
    <Box component='img' draggable={false} src={name} width={34.4} height={34.4} sx={{ml: 1, mr: 2}}/>
  )
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
                    <IconInCircle {...item.icon}/>
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
