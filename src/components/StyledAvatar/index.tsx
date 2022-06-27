import { FC } from 'react'
import PropTypes from 'prop-types';
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
  variant?: "circular" | "square" | "rounded";
  width?: number;
}

const StyledAvatar: FC<StyledAvatarProps> = (props) => {
  const {alt, src, width=47, variant='circular'} = props

  return (
    <StyledBox style={{
      width: width+8,
      height: width+8,
    }}>
      <Avatar
        variant={variant}
        sx={{
          width: width,
          height: width,
          transition: 'border-radius .2s',
        }}
        alt={alt}
        src={src}
      />
    </StyledBox>
  );
}

StyledAvatar.propTypes = {
  variant: PropTypes.oneOf([
    "circular",
    "square",
    "rounded"
  ])
}

export default StyledAvatar;
