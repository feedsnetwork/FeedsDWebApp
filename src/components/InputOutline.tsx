import { OutlinedInput, styled } from '@mui/material';

const InputOutline = styled(OutlinedInput)(
  ({ theme }) => `
    background-color: ${theme.colors.alpha.white[100]};
    padding-right: ${theme.spacing(0.7)}
`
);

export default InputOutline;
