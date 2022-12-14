import React from 'react'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { Box, Container, Stack } from '@mui/material';

import { EmptyView } from 'components/EmptyView'
import ChannelListCard from './ChannelListItem';
import { selectSubscriptionByUserDid } from 'redux/slices/channel';

const SubscriptionList = ()=>{
  const params = useParams();
  const subscribedChannels = useSelector(selectSubscriptionByUserDid(params.userDid))
  return (
    <>
      {
        !subscribedChannels.length?
        <EmptyView type='subscription'/>:

        <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
          <Container sx={{ mt: 3, flexGrow: 1, overFlow: 'auto', px: { xs: 3, sm: 6} }} maxWidth="lg">
            <Stack spacing={1}>
              {
                subscribedChannels.map((channel, _i)=><ChannelListCard channel={channel} key={channel['channel_id']}/>)
              }
            </Stack>
          </Container>
        </Box>
      }
    </>
  )
}

export default SubscriptionList;