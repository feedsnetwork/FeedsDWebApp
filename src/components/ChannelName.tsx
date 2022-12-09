import { Typography } from '@mui/material';
import StyledIcon from './StyledIcon';

const ChannelName = (props)=>{
  const { name, isPublic, variant="subtitle1" } = props
  const styledName = `c/${name}`
  return (
    <Typography variant={variant} sx={{display: 'flex', alignItems: 'center', wordBreak: 'break-all'}}>
      {styledName}
      {
        isPublic &&
        <>&nbsp;<StyledIcon icon="bi:x-diamond-fill" /></>
      }
      &nbsp;
      {props.children}
    </Typography>
  )
}
export default ChannelName
