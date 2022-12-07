import { FC, useRef, useEffect, useState } from 'react'
import PropTypes from 'prop-types';
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Avatar, Box, styled } from '@mui/material';
import TouchRipple from '@mui/material/ButtonBase/TouchRipple';

import AvatarSkeleton from 'components/Skeleton/AvatarSkeleton';
import { getImageSource } from 'utils/common'

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
    .avatar-wrapper img {
      border-radius: 50%;
    }
    &.channel-focused>.avatar-wrapper img {
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
      & img {
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
  channel: any;
  variant?: "circular" | "square" | "rounded";
  width?: number;
  onClick?: (e)=>void;
  onRightClick?: (e)=>void;
  focused?: Boolean;
}

const ChannelAvatar: FC<ChannelAvatarProps> = (props) => {
  const { channel, width=40, variant = 'circular', onClick=(e)=>{}, onRightClick=(e)=>{}, focused=false } = props
  const avatarSrc = getImageSource(channel['avatarSrc'])
  const rippleRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoadError, setIsLoadError] = useState(false)

  useEffect(()=>{
    setIsLoadError(false)
  }, [avatarSrc])

  const handleErrorImage = (e) => {
    const imgSrc = e.target.getAttribute('src')
    if(!imgSrc.startsWith("http")) {
      setIsLoadError(true)
      return
    }
    setIsLoaded(false)
    fetch(imgSrc)
      .then(res=>res.text())
      .then(res=>{
        e.target.src=res
        setIsLoaded(true)
      })
  }
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
        {
          avatarSrc && !isLoadError?
          <>
            {
              !isLoaded && <Box sx={{width, height: width, lineHeight: 1, position: 'absolute'}}><AvatarSkeleton/></Box>
            }
            <LazyLoadImage
              src={avatarSrc}
              effect="blur" 
              wrapperProps={{
                style:{
                  display: 'contents'
                }
              }} 
              style={{
                margin: 'auto',
                width: width,
                height: width,
                transition: 'border-radius .2s',
                opacity: isLoaded? 1: 0
              }} 
              afterLoad={()=>setIsLoaded(true)} 
              onError={handleErrorImage}
            />
          </>:

          <Avatar
            variant={variant}
            sx={{
              width: width,
              height: width,
              transition: 'border-radius .2s',
            }}
            alt={channel['name']}
            src={avatarSrc}
          />
        }
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
