import { FC, useContext } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Stack } from '@mui/material';

import StyledButton from 'src/components/StyledButton';
import { OverPageContext } from 'src/contexts/OverPageContext';

interface EmptyViewInProfileProps {
  type?: string;
}
const EmptyViewInProfile: FC<EmptyViewInProfileProps> = ({ type = 'home' })=>{
  const { openAddChannelView } = useContext(OverPageContext);

  let subTitle = 'Your timeline is empty'
  let description = 'Add new channel or find new\nchannels to subscribe!'
  if(type==='channel'){
    subTitle = 'No channels found'
    description = "Let's change that, get started with\nyour first channel!"
  }
  else if(type==='subscription'){
    subTitle = 'No subscriptions found'
    description = "Subscribe to channels that maybe of\ninterest to you on Explore Feeds"
  }

  return (
    <Stack alignItems='center'>
      <Box component='img' src='post-chat.svg' width={{xs: 50, md: 65, lg: 80}} pt={{xs: 1, sm: 2}} pb={{xs: 1, sm: 2}}/>
      <Typography variant='h4' align='center'>
        {subTitle}
      </Typography>
      <Stack spacing={4}>
        <Typography variant='body2' component="pre" sx={{opacity: .8}} align='center'>
          {description}
        </Typography>
        {
          type==='subscription'?
          <StyledButton type="outline" fullWidth>Explore Feeds</StyledButton>:
          
          <StyledButton type="outline" fullWidth onClick={()=>{openAddChannelView()}}>Add Channel</StyledButton>
        }
      </Stack>
    </Stack>
  );
}

EmptyViewInProfile.propTypes = {
  type: PropTypes.oneOf([
    'home',
    'channel',
    'subscription',
  ])
};

export default EmptyViewInProfile;
