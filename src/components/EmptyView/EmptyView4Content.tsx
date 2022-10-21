import { FC, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Box, Typography, Stack } from '@mui/material';

import StyledButton from 'components/StyledButton';
import { OverPageContext } from 'contexts/OverPageContext';

interface EmptyViewProps {
  type?: string;
}
const EmptyView: FC<EmptyViewProps> = ({ type = 'home' })=>{
  const { openAddChannelView } = useContext(OverPageContext);
  const navigate = useNavigate()
  
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
  else if(type==='post'){
    subTitle = 'No posts found'
    description = "This user has not posted anything yet.\nPlease come back later!"
  }

  const link2explore = ()=>{
    navigate('/explore')
  }
  return (
    <Stack alignItems='center'>
      <Box component='img' src='/post-chat.svg' width={{xs: 80, md: 100, lg: 120}} pt={{xs: 5, sm: 6, md: 10, lg: 12}} pb={{xs: 3, sm: 4, md: 6, lg: 8}}/>
      <Typography variant='h4' align='center'>
        {subTitle}
      </Typography>
      <Stack spacing={4}>
        <Typography variant='body2' component="pre" sx={{opacity: .8}} align='center'>
          {description}
        </Typography>
        {
          type==='subscription' || type==='post'?
          <StyledButton type="outline" fullWidth onClick={link2explore}>Explore Feeds</StyledButton>:

          <>
            <StyledButton type="outline" fullWidth onClick={()=>{openAddChannelView()}}>Add Channel</StyledButton>
            <StyledButton type="outline" fullWidth onClick={link2explore}>Explore Feeds</StyledButton>
          </>
        }
      </Stack>
    </Stack>
  );
}

EmptyView.propTypes = {
  type: PropTypes.oneOf([
    'home',
    'channel',
    'post',
    'subscription',
  ])
};

export default EmptyView;
