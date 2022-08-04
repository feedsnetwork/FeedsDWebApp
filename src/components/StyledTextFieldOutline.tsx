import { TextField, styled } from '@mui/material';

const StyledTextFieldOutline = styled(TextField)(
  ({ theme }) => `
    &:before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 16px; 
      padding: 1px; 
      background: linear-gradient(90deg, #7624FE 0%, #368BFF 100%);
      -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
              mask-composite: exclude; 
    }
    & .MuiOutlinedInput-notchedOutline {
      border-width: 0px;
    }
    background: transparent;
`
);

export default StyledTextFieldOutline;
