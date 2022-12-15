import { Typography, Tooltip } from '@mui/material';
import StyledIcon from './StyledIcon';

const ChannelName = (props)=>{
  const { name, isPublic, variant="subtitle1", sx={} } = props
  const styledName = `c/${name}`
  return (
    <Typography variant={variant} sx={{display: 'flex', alignItems: 'center', wordBreak: 'break-all', ...sx}}>
      {styledName}
      {
        isPublic &&
        <>&nbsp;<Tooltip arrow title="Channel NFT" disableInteractive enterTouchDelay={0}><span><StyledIcon icon="bi:x-diamond-fill" /></span></Tooltip></>
      }
      {
        !!props.children &&
        <>&nbsp;{props.children}</>
      }
    </Typography>
  )
}
export default ChannelName
