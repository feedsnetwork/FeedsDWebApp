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
    <svg width={0} height={0}>
      <linearGradient id="linearColors" x1={0} y1={1} x2={1} y2={1}>
        <stop offset={0} stopColor="#7624FE" />
        <stop offset={1} stopColor="#368BFF" />
      </linearGradient>
    </svg>
    <Icon {...props} style={{ fill: 'url(#linearColors)' }}/>
  </Box>
}

export default StyledIcon;
