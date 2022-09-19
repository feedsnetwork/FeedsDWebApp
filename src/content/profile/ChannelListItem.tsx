import React from 'react';
import { Card, Box, Typography, Stack, Hidden } from '@mui/material';

import StyledButton from 'src/components/StyledButton'
import StyledAvatar from 'src/components/StyledAvatar'
import { HiveApi } from 'src/services/HiveApi'

const ChannelListItem = (props) => {
  const {channel} = props
  const [subscribers, setSubscribers] = React.useState([])
  const hiveApi = new HiveApi()
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const userDid = `did:elastos:${feedsDid}`

  React.useEffect(()=>{
    hiveApi.querySubscriptionInfoByChannelId(userDid, channel.channel_id)
      .then(res=>{
        if(res['find_message'])
          setSubscribers(res['find_message']['items'])
        console.log(res, "===========1")
      })
  }, [])

  return <Card sx={{background: (theme)=>theme.palette.primary.main, p: 2}}>
    <Stack direction="row" spacing={2} alignItems="center">
      <StyledAvatar alt={channel.name} src={channel.avatarSrc}/>
      <Box flex={1}>
        <Hidden mdDown>
          <Typography variant="subtitle2">{channel.name}</Typography>
          <Typography variant="body2">{channel.intro}</Typography>
          <Stack direction="row" sx={{flexWrap: 'wrap', mt: 1}}>
            <Typography variant="body2" pr={3}><strong>{subscribers.length}</strong> Subscribers</Typography>
          </Stack>
        </Hidden>
      </Box>
      <StyledButton type="outlined" size="small" sx={{height: 'fit-content'}}>Edit Channel</StyledButton>
    </Stack>
    <Hidden mdUp>
      <Box mt={1}>
        <Typography variant="subtitle2">{channel.name}</Typography>
        <Typography variant="body2">{channel.intro}</Typography>
        <Stack direction="row" sx={{flexWrap: 'wrap', mt: 1}}>
          <Typography variant="body2" pr={3}><strong>{subscribers.length}</strong> Subscribers</Typography>
        </Stack>
      </Box>
    </Hidden>
  </Card>
}

export default ChannelListItem;
