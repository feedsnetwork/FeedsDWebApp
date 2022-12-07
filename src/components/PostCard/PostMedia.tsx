import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
  return (
    !thumbnailSrc?
    <div />:
    <Box pl={2}>
      <Box component='img' src={thumbnailSrc} sx={direction==='row'? {width: 180, borderRadius: 1}: {width: '100%'}} onClick={handleOpenScreen}/>
    </Box>
  )
}

export default React.memo(PostMedia);