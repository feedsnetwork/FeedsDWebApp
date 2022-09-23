import { Button, styled } from '@mui/material';
import { LoadingButton } from '@mui/lab';

const GradientStyledButton = (styledBtnFunc, type)=>{
  if(type=='contained') {
    return styledBtnFunc(
      ({ theme }) => `
        background: linear-gradient(90deg, #7624FE 0%, #368BFF 100%);
    `
    );
  }
  return styledBtnFunc(
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
}

function StyledButton(props) {
  const { children, type='contained', needLoading=false, size='medium', sx={} ...restProps} = props
  const styledBtnFunc = styled(needLoading?LoadingButton:Button)
  const GradientButton = GradientStyledButton(styledBtnFunc, type)
  return (
      <GradientButton 
        {...restProps}
        variant='contained' 
        sx={{
          ...sx,
          '&:hover': {
            background: 'linear-gradient(90deg, #641fd7 0%, #2f78db 100%)',
          },
          ...(size==='small'?{padding: '5px 16px 4px'}:{})
        }}
        size={size}
      >
        {children}
      </GradientButton>
  );
}

export default StyledButton;
