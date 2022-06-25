import { FC } from 'react'
import { Avatar, Box, styled } from '@mui/material';

const StyledBox = styled(Box)(
  ({ theme }) => `
    &:before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 50%; 
      padding: 2px; 
      background: linear-gradient(90deg, #7624FE 0%, #368BFF 100%);
      -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
              mask-composite: exclude; 
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
  width?: number;
}

const StyledAvatar: FC<StyledAvatarProps> = (props) => {
  const {alt, src, width=45} = props

  return (
    <StyledBox style={{
      width: width+10,
      height: width+10,
    }}>
      <Avatar
        sx={{
          width: width,
          height: width
        }}
        alt={alt}
        src={src}
      />
    </StyledBox>
  );
}

StyledAvatar.propTypes = {
}

export default StyledAvatar;
