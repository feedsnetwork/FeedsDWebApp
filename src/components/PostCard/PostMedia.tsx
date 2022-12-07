import React from 'react'
import { useSelector } from 'react-redux'
import { Box } from '@mui/material';

import { selectLoadedPostMedia } from 'redux/slices/post';
import { getLocalDB } from 'utils/db';
import { decodeBase64 } from 'utils/common';

const PostMedia = (props) => {
  const { postId, direction } = props
  const loadedPostMedia = useSelector(selectLoadedPostMedia(postId))
  const [thumbnailSrc, setThumbnailSrc] = React.useState('')
  // const [mediaSrc, setMediaSrc] = React.useState('')
  const LocalDB = getLocalDB()
  console.info(loadedPostMedia)
  React.useEffect(()=>{
    if(loadedPostMedia) {
      LocalDB.find({
        selector: {_id: loadedPostMedia},
        fields: ['thumbnail']
      })
        .then(res=>{
          console.info(res.docs)
          if(res.docs.length) {
            setThumbnailSrc(decodeBase64(res.docs[0]['thumbnail']))
          }
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedPostMedia])

  return (
    !thumbnailSrc?
    <div />:
    <Box pl={2}>
      <Box component='img' src={thumbnailSrc} sx={direction==='row'? {width: 180, borderRadius: 1}: {width: '100%'}}/>
    </Box>
  )
}

export default React.memo(PostMedia);