import { FC, useState, useEffect } from 'react'
import { Box, styled, Avatar } from '@mui/material';
import { LazyLoadImage } from "react-lazy-load-image-component";
import AvatarSkeleton from 'components/Skeleton/AvatarSkeleton';

const StyledBox = styled(Box)(
  ({ theme }) => `
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
`
);

interface NoRingAvatarProps {
  alt?: string;
  src?: string;
  style?: object;
  width?: number;
}

const NoRingAvatar: FC<NoRingAvatarProps> = (props) => {
  const {alt, src, width=47, style={}} = props
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoadError, setIsLoadError] = useState(false)

  useEffect(()=>{
    setIsLoadError(false)
  }, [src])

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

  return (
    <StyledBox style={{...style}}>
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
              opacity: isLoaded? 1: 0
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
export default NoRingAvatar;