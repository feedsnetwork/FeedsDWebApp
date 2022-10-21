import { IconButton } from '@mui/material';

import StyledIcon from './StyledIcon'

const StyledIconButton = (props) => {
  const {icon, onClick=()=>{}} = props
  return <IconButton component="span" onClick={onClick}>
    <StyledIcon icon={icon}/>
  </IconButton>
}

export default StyledIconButton;
