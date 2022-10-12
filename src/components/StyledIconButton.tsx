import { IconButton, styled } from '@mui/material';
import { Icon } from '@iconify/react';

import StyledIcon from './StyledIcon'

const StyledIconButton = (props) => {
  const {icon, onClick=()=>{}} = props
  return <IconButton component="span" onClick={onClick}>
    <StyledIcon icon={icon}/>
  </IconButton>
}

export default StyledIconButton;
