import { Switch, styled } from '@mui/material';

const SwitchUI = styled(Switch)(({ theme }) => ({
  width: 52,
  height: 32,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 4,
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: `${theme.colors.alpha.black[100]} !important`,
    width: 24,
    height: 24,
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.colors.primary.main,
    borderRadius: 40 / 2,
    border: 0
  },
  '& .Mui-checked+.MuiSwitch-track': {
    background: 'linear-gradient(90deg, #7624FE 0%, #368BFF 100%)',
    opacity: '1 !important'
  },
}));

export default SwitchUI;
