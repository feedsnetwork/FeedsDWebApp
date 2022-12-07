import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Box, Toolbar, Modal, IconButton, Backdrop, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { selectPostImgPath, selectPostImgScreenState, setOpenImageScreen } from 'redux/slices/post';
import { decodeBase64 } from 'utils/common';
import { getLocalDB } from 'utils/db';

const BackdropStyle = styled(Backdrop)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.8)'
}));

function PostImgScreen() {
  const dispatch = useDispatch()
  const isOpen = useSelector(selectPostImgScreenState)
  const postImgPath = useSelector(selectPostImgPath)
  const [imageSrc, setImageSrc] = React.useState('')
  const imageBoxRef = React.useRef();
  const LocalDB = getLocalDB()

  React.useEffect(()=>{
    setImageSrc('')
    if(postImgPath) {
      LocalDB.find({
        selector: {_id: postImgPath},
        fields: ['source']
      })
        .then(res=>{
          if(res.docs.length) {
            setImageSrc(decodeBase64(res.docs[0]['source']))
          }
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postImgPath])

  const handleClose = () => {
    dispatch(setOpenImageScreen(false))
  };
  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      BackdropComponent={BackdropStyle}
    >
      <Box>
        <Toolbar sx={{
            position: 'fixed',
            top: 0,
            width: '100vw',
            backgroundColor: 'rgba(0,0,0,.5)',
            zIndex: 1
          }}>
          <Box sx={{ flexGrow: 1 }}/>
          <IconButton
            edge="start"
            aria-label="menu"
            sx={{color: "white"}}
            onClick={handleClose}
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
        <Box 
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          ref={imageBoxRef}
        >
          <LazyLoadImage
            src={imageSrc}
            effect="blur" 
            wrapperProps={{
              style:{
                display: 'contents'
              }
            }} 
            style={{
              margin: 'auto',
              width: '100%',
              height: '100%',
            }} 
          />
        </Box>
      </Box>
    </Modal>
  );
}

export default PostImgScreen