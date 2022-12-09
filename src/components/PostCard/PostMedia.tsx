import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Box } from '@mui/material';

import { selectLoadedPostMedia, setActiveImagePath, setOpenImageScreen } from 'redux/slices/post';
import { getLocalDB } from 'utils/db';
import { decodeBase64 } from 'utils/common';

const PostMedia = (props) => {
  const { postId, direction } = props
  const loadedPostMedia = useSelector(selectLoadedPostMedia(postId))
  const [thumbnailSrc, setThumbnailSrc] = React.useState('')
  const LocalDB = getLocalDB()
  const dispatch = useDispatch()
  const imageRef = React.useRef();

  React.useEffect(()=>{
    setThumbnailSrc('')
    if(loadedPostMedia) {
      LocalDB.find({
        selector: {_id: loadedPostMedia},
        fields: ['thumbnail']
      })
        .then(res=>{
          if(res.docs.length) {
            setThumbnailSrc(decodeBase64(res.docs[0]['thumbnail']))
          }
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedPostMedia])

  const handleOpenScreen = (e)=>{
    e.stopPropagation()
    dispatch(setActiveImagePath(loadedPostMedia))
    dispatch(setOpenImageScreen(true))
  }
  const handleResize = ()=>{
    const myImg = document.querySelector(`.img-${postId}`);
    const ratio = myImg['width'] / (myImg['height'] || 1)
    const limitRatio = 1.6
    if(ratio >= limitRatio)
      document.querySelector(`.span-${postId}`)['style'].height = 'auto'
    else
      document.querySelector(`.span-${postId}`)['style'].height = `${Math.ceil(myImg['width']/limitRatio)}px`
  }
  const ImgBoxSx = direction === 'row'? {pl: 2}: {pt: 2}
  const ImgWrapperStyle = { 
    display: 'flex', 
    alignItems: 'center', 
    overflow: 'hidden',
    borderRadius: direction==='row'? 18: 8,
  }
  return (
    !thumbnailSrc?
    <div />:
    <Box {...ImgBoxSx} ref={imageRef}>
      <LazyLoadImage
        className={`img-${postId}`}
        src={thumbnailSrc}
        effect="blur" 
        wrapperProps={{
          style: ImgWrapperStyle,
          className: `span-${postId}`
        }} 
        style={{
          width: direction==='row'? 180: '100%',
          // height: width,
          transition: 'border-radius .2s',
        }} 
        afterLoad={handleResize} 
        onClick={handleOpenScreen}
      />
    </Box>
  )
}

export default React.memo(PostMedia);