import { FC, useState } from 'react'
import { Box, styled, Avatar } from '@mui/material';
import { LazyLoadImage } from "react-lazy-load-image-component";
import AvatarSkeleton from 'components/Skeleton/AvatarSkeleton';

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

const StyledAvatar: FC<StyledAvatarProps> = (props) => {
  const {alt, src, width=47, style={}} = props
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoadError, setIsLoadError] = useState(false)

  const handleErrorImage = (e) => {
    if(!e.target.src.startsWith("http")) {
      setIsLoadError(true)
      return
    }
    setIsLoaded(false)
    fetch(e.target.src)
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
      {
        src && !isLoadError?
        <>
          {
            !isLoaded && <Box sx={{width, height: width, lineHeight: 1, position: 'absolute'}}><AvatarSkeleton/></Box>
          }
          <LazyLoadImage 
            src={src}
            effect="blur" 
            wrapperProps={{
              style:{
                display: 'contents'
              }
            }} 
            style={{
              borderRadius: '50%',
              margin: 'auto',
              width: width,
              height: width,
              transition: 'border-radius .2s',
            }} 
            afterLoad={()=>setIsLoaded(true)} 
            onError={handleErrorImage}
          />
        </>:
        
        <Avatar
          sx={{
            width: width,
            height: width,
            transition: 'border-radius .2s',
          }}
          alt={alt}
          src={src}
        />
      }
    </StyledBox>
  );
}
export default StyledAvatar;