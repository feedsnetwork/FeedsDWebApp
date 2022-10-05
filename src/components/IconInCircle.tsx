import { Box } from '@mui/material';
import { Icon } from '@iconify/react';

const IconInCircle = (props)=>{
  const {name, stress=false} = props
  return (
    <Box sx={{p: .8, background: stress?'#FF453A':(theme)=>theme.palette.primary.main, borderRadius: '50%', display: 'flex', mr: 2, color: stress?'#161C24':'#C4C4C4'}}>
      <Icon icon={name} width={18} height={18}/>
    </Box>
  )
}
export default IconInCircle
