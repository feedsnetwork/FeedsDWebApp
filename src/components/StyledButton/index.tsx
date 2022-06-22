import { Button, styled } from '@mui/material';

const GradientContainButton = styled(Button)(
  ({ theme }) => `
    background: linear-gradient(90deg, #7624FE 0%, #368BFF 100%);
`
);

const GradientOutlineButton = styled(Button)(
  ({ theme }) => `
    &:before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 16px; 
      padding: 2px; 
      background: linear-gradient(90deg, #7624FE 0%, #368BFF 100%);
      -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
              mask-composite: exclude; 
    }
    background: transparent;
`
);

function StyledButton(props) {
  const { children, type='contained', ...restProps} = props
  const GradientButton = type==='contained' ? GradientContainButton : GradientOutlineButton
  return (
      // <GradientContainButton 
      //   {...restProps}
      //   variant='contained' 
      //   sx={{
      //     '&:hover': {
      //       background: 'linear-gradient(90deg, #641fd7 0%, #2f78db 100%)',
      //     }
      //   }}
      // >
      //   {children}
      // </GradientContainButton>

      <GradientButton 
        {...restProps}
        variant='contained' 
        sx={{
          '&:hover': {
            background: 'linear-gradient(90deg, #641fd7 0%, #2f78db 100%)',
          }
        }}
      >
        {children}
      </GradientButton>
  );
}

export default StyledButton;
