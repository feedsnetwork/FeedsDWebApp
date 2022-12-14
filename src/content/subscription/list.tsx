import React from 'react'
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { Box, Container, Stack } from '@mui/material';

import { EmptyView } from 'components/EmptyView'
import ChannelListCard from './ChannelListCard';
import { selectSubscriptionByUserDid } from 'redux/slices/channel';
import { getFullDIDstring } from 'utils/common';

const SubscriptionList = ()=>{
  const params = useParams();
  const userDID = getFullDIDstring(params.userDid)
  const subscribedChannels = useSelector(selectSubscriptionByUserDid(userDID))
  return (
    <>
      {
        !subscribedChannels.length?
        <EmptyView type='subscription'/>:

        <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
          <Container sx={{ mt: 3, flexGrow: 1, overFlow: 'auto', px: { xs: 3, sm: 6} }} maxWidth="lg">
            <Stack spacing={3} pb={3}>
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