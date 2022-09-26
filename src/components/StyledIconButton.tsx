import { IconButton, styled } from '@mui/material';
import { Icon } from '@iconify/react';

import StyledIcon from './StyledIcon'

const StyledIconButton = ({icon}) => 
  <IconButton component="span">
    <StyledIcon icon={icon}/>
  </IconButton>

export default StyledIconButton;
