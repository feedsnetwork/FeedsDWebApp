import { useSelector } from 'react-redux';
import { useParams } from 'react-router';
import { Box, Container, Stack } from '@mui/material';

import SubscriberListCard from './SubscriberListCard';
import { selectChannelById } from 'redux/slices/channel';

const SubscriberList = ()=>{
  const params = useParams();
  const channelInfo = useSelector(selectChannelById(params?.channelId)) || {}
  const subscribers = channelInfo['subsribers'] || []
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <Container sx={{ mt: 3, flexGrow: 1, overFlow: 'auto', px: { xs: 3, sm: 6} }} maxWidth="lg">
        <Stack spacing={3} pb={3}>
          {
            subscribers.map((user, _i)=><SubscriberListCard subscriber={user} key={user['user_did']}/>)
          }
        </Stack>
      </Container>
    </Box>
  )
}

export default SubscriberList;