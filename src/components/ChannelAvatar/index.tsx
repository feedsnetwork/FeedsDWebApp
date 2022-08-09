import { FC, useRef } from 'react'
import PropTypes from 'prop-types';
import { Avatar, Box, styled } from '@mui/material';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';

const ChannelWrapper = styled(Box)(
  ({ theme }) => `
    width: 100%;
    position: relative;
    &.channel>.pill, &.channel-focused>.pill {
      position: absolute;
      left: 0;
      top: 0;
      width: 8px;
      height: 48px;
      display: flex;
      align-items: center;
    }
    &.channel>.pill>span, &.channel-focused>.pill>span {
      height: 8px;
      width: 8px;
      border-radius: 0 4px 4px 0;
      margin-left: -4px;
      background-color: white;
      transition: height .2s;
    }
    &.channel-focused>.pill>span {
      height: 32px;
    }
    &.channel:hover .pill>span {
      height: 20px
    }
    &.channel> .pill:hover>span {
      height: 8px
    }
    &.channel-focused>.avatar-wrapper:before {
      border-radius: 16px;
    }
    &.channel-focused>.avatar-wrapper>.MuiAvatar-root {
      border-radius: 12px;
    }
  `
)

const AvatarWrapper = styled(Box)(
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
    &:hover {
      &:before {
        border-radius: 16px;
      },
      & .MuiAvatar-root {
        border-radius: 12px;
      }
    }
    border-radius: 16px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin: auto;
`
);

interface ChannelAvatarProps {
  alt?: string;
  src?: string;
  variant?: "circular" | "square" | "rounded";
  width?: number;
  onClick?: (e)=>void;
  onRightClick?: (e)=>void;
  focused?: Boolean;
}

const ChannelAvatar: FC<ChannelAvatarProps> = (props) => {
  const { alt, src, width=40, variant = 'circular', onClick=(e)=>{}, onRightClick=(e)=>{}, focused=false } = props

  const rippleRef = useRef(null);
  const onRippleStart = (e) => {
    rippleRef.current.start(e);
  };
  const onRippleStop = (e) => {
    rippleRef.current.stop(e);
  };

  return (
    <ChannelWrapper className={focused?'channel-focused':'channel'}>
      <Box className='pill'>
        <span/>
      </Box>
      <AvatarWrapper 
        className='avatar-wrapper'
        sx={{
          overflow: 'hidden',
          width: width+8,
          height: width+8,
        }}
        onMouseDown={onRippleStart}
        onMouseUp={onRippleStop}
        onClick={onClick}
        onContextMenu={onRightClick}
      >
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
        <TouchRipple ref={rippleRef} center={false} />
      </AvatarWrapper>
    </ChannelWrapper>
  );
}

ChannelAvatar.propTypes = {
  variant: PropTypes.oneOf([
    "circular",
    "square",
    "rounded"
  ])
}

export default ChannelAvatar;
