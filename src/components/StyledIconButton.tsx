import { IconButton, styled } from '@mui/material';
import { Icon } from '@iconify/react';

const StyledIconButton = ({icon}) => 
  <IconButton sx={{
    '& .iconify>path[fill=currentColor]': {
      fill: 'unset'
    }
  }}>
    <svg width={0} height={0}>
      <linearGradient id="linearColors" x1={0} y1={1} x2={1} y2={1}>
        <stop offset={0} stopColor="#7624FE" />
        <stop offset={1} stopColor="#368BFF" />
      </linearGradient>
    </svg>
    <Icon icon={icon} style={{ fill: 'url(#linearColors)' }}/>
  </IconButton>

export default StyledIconButton;
