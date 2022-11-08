import { Icon } from '@iconify/react';
import { Box } from '@mui/material';

const StyledIcon = (props) => {
  return <Box sx={{
    display: 'flex',
    justifyContent: 'center',
    '& .iconify>path[fill=currentColor], & .iconify>g[fill=currentColor]': {
      fill: 'unset'
    }
  }}>
    <Icon {...props} style={{ fill: 'url(#linearColors)' }}/>
  </Box>
}

export default StyledIcon;
