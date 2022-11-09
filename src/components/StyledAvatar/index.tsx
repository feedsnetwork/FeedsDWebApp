import { FC } from 'react'
import { Box, styled } from '@mui/material';

const StyledBox = styled(Box)(
  ({ theme, width }) => `
    &:before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 50%; 
      padding: ${width<30?'1px':'2px'}; 
      background: linear-gradient(90deg, #7624FE 0%, #368BFF 100%);
      -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
              mask-composite: exclude; 
      transition: border-radius .2s;
    }
    // background: transparent;
    // borderRadius: '50%';
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
`
);

interface StyledAvatarProps {
  alt?: string;
  src?: string;
  style?: object;
  width?: number;
}

const AvatarBox = styled(Box)(({ theme }) => ({
  borderRadius: '50%',
  display: 'flex',
  margin: 'auto',
})) as any;

const StyledAvatar: FC<StyledAvatarProps> = (props) => {
  const {alt, src, width=47, style={}} = props
  const handleErrorImage = (e) => {
    // e.target.src = '/loading.svg'
    if(!src.startsWith("http"))
      return
    fetch(src)
      .then(res=>res.text())
      .then(res=>{
        e.target.src=res
      })
  }
  return (
    <StyledBox 
      width={width}
      style={{
        minWidth: width<30 ? width+6 : width+8,
        width: width<30 ? width+6 : width+8,
        height: width<30 ? width+6 : width+8,
        ...style
      }}
    >
      <AvatarBox 
        draggable={false} 
        component="img" 
        src={src} 
        alt={alt}
        sx={{
          width: width,
          height: width,
          transition: 'border-radius .2s',
        }}
        onError={handleErrorImage}
      />
    </StyledBox>
  );
}
export default StyledAvatar;