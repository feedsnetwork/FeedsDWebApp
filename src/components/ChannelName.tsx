import { Typography } from '@mui/material';
import StyledIcon from './StyledIcon';

const ChannelName = (props)=>{
  const { name, isPublic, variant="subtitle1", sx={} } = props
  const styledName = `c/${name}`
  return (
    <Typography variant={variant} sx={{display: 'flex', alignItems: 'center', wordBreak: 'break-all', ...sx}}>
      {styledName}
      {
        isPublic &&
        <>&nbsp;<StyledIcon icon="bi:x-diamond-fill" /></>
      }
      {
        !!props.children &&
        <>&nbsp;{props.children}</>
      }
    </Typography>
  )
}
export default ChannelName
