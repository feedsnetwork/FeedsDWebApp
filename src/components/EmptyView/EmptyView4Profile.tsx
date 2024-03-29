import { FC } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Stack } from '@mui/material';

import { useNavigate } from 'react-router';
import StyledButton from 'components/StyledButton';

interface EmptyViewInProfileProps {
  type?: string;
}

const EmptyViewInProfile: FC<EmptyViewInProfileProps> = ({ type = 'channel' })=>{
  const navigate = useNavigate()

  const contentTypes = {
    channel: {
      logo: '/post-chat.svg',
      title: 'No channels found',
      description: "Let's change that, get started with\nyour first channel!",
      buttonName: 'Add Channel',
      buttonFunc: ()=>navigate('/channel/add')
    },
    collectible: {
      logo: '/collectible-group.svg',
      title: 'No collectibles found',
      description: "Create a collectible or buy one from\nPasar Lite marketplace!",
      buttonName: 'Create Collectible',
      buttonFunc: ()=>{}
    },
    like: {
      logo: '/like-logo.svg',
      title: 'Nothing liked yet',
      description: "See what's being posted on the\ntimeline!",
      buttonName: 'Timeline',
      buttonFunc: ()=>navigate('/home')
    }
  }

  const contentObj = contentTypes[type] || {}
  const { logo, title, description, buttonName, buttonFunc } = contentObj
  return (
    <Stack alignItems='center'>
      <Box component='img' src={logo} width={{xs: 50, md: 65, lg: 80}} pt={{xs: 1, sm: 2}} pb={{xs: 1, sm: 2}}/>
      <Typography variant='h4' align='center'>
        {title}
      </Typography>
      <Stack spacing={4}>
        <Typography variant='body2' component="pre" sx={{opacity: .8}} align='center'>
          {description}
        </Typography>
        <StyledButton type="outline" fullWidth onClick={()=>{buttonFunc()}}>{buttonName}</StyledButton>
      </Stack>
    </Stack>
  );
}

EmptyViewInProfile.propTypes = {
  type: PropTypes.oneOf([
    'channel',
    'collectible',
    'like',
  ])
};

export default EmptyViewInProfile;
