import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { Card, Box, Typography, Stack, Hidden } from '@mui/material';

import ChannelName from 'components/ChannelName';
import NoRingAvatar from 'components/NoRingAvatar';
import SubscribeButton from 'components/SubscribeButton';
import { setFocusedChannelId, setVisitedChannelId } from 'redux/slices/channel';
import { getImageSource } from 'utils/common'

const ChannelListCard = (props) => {
  const {channel} = props
  const {display_name: name, avatarSrc, intro, is_public} = channel
  const avatarImg = getImageSource(avatarSrc)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const link2channel = ()=>{
    if(channel['is_self']) {
      dispatch(setFocusedChannelId(channel['channel_id']))
      navigate('/channel')
    }
    else if(channel['is_subscribed']) {
      dispatch(setVisitedChannelId(channel['channel_id']))
      navigate('/subscription/channel');
    }
    else {
      dispatch(setVisitedChannelId(channel['channel_id']))
      navigate('/explore/channel');
    }
  }
  const subscriberCount = channel['subscribers']?.length || 0
  return <Card sx={{background: (theme)=>theme.palette.primary.main, p: 2, cursor: 'pointer'}} onClick={link2channel}>
    <Stack direction="row" spacing={2} alignItems="center">
      <NoRingAvatar alt={name} src={avatarImg}/>
      <Box flex={1}>
        <Hidden mdDown>
          <ChannelName name={name} isPublic={is_public} variant="subtitle2"/>
          <Typography variant="body2">{intro}</Typography>
          <Stack direction="row" sx={{flexWrap: 'wrap', mt: 1}}>
            <Typography variant="body2" pr={3}><strong>{subscriberCount}</strong> Subscribers</Typography>
          </Stack>
        </Hidden>
      </Box>
      <SubscribeButton channel={channel}/>
    </Stack>
    <Hidden mdUp>
      <Box mt={1}>
        <ChannelName name={name} isPublic={is_public} variant="subtitle2"/>
        <Typography variant="body2">{channel.intro}</Typography>
        <Stack direction="row" sx={{flexWrap: 'wrap', mt: 1}}>
          <Typography variant="body2" pr={3}><strong>{subscriberCount}</strong> Subscribers</Typography>
        </Stack>
      </Box>
    </Hidden>
  </Card>
}

export default ChannelListCard;
