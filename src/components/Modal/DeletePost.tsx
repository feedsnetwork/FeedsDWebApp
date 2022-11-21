import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, Typography, Stack } from '@mui/material';
import { useSnackbar } from 'notistack';

import StyledButton from '../StyledButton';
import StyledIcon from '../StyledIcon'
import { CommonStatus } from 'models/common_content';
import { handleDelPostModal, selectActivePost, selectDelPostModalState } from 'redux/slices/post';
import { HiveApi } from 'services/HiveApi'
import { getLocalDB } from 'utils/db';

function DeletePost() {
  const [onProgress, setOnProgress] = React.useState(false);
  const dispatch = useDispatch()
  const isOpen = useSelector(selectDelPostModalState)
  const activePost = useSelector(selectActivePost)

  const { enqueueSnackbar } = useSnackbar();
  const hiveApi = new HiveApi()
  const LocalDB = getLocalDB()

  React.useEffect(()=>{
    if(!isOpen) {
      setOnProgress(false)
    }
  }, [isOpen])

  const handleAction = async (e) => {
    if(e.currentTarget.value === 'ok') {
      setOnProgress(true)
      hiveApi.deletePost(activePost?.post_id, activePost?.channel_id)
        .then(_=>{
          LocalDB.upsert(activePost?.post_id, (doc)=>{
            if(doc._id) {
              doc['status'] = CommonStatus.deleted
              return doc
            }
            return false
          })
          enqueueSnackbar('Delete post success', { variant: 'success' });
          setOnProgress(false)
          handleClose()
        })
        .catch(err=>{
          enqueueSnackbar('Delete post error', { variant: 'error' });
        })
    } else {
      handleClose()
    }
  }

  const handleClose = () => {
    handleDelPostModal(false)(dispatch)
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} onClick={(e)=>{e.stopPropagation()}}>
      <DialogContent sx={{minWidth: {sm: 'unset', md: 400}}}>
        <Stack spacing={2} sx={{textAlign: 'center'}}>
          <Typography variant="h5">Delete Post</Typography>
          <StyledIcon icon="fa6-solid:trash-can" width={64} height={64}/>
          <Typography variant="body2">Are you sure you want to delete this post?</Typography>
          <Stack direction="row" spacing={3}>
            <StyledButton type="outlined" fullWidth value='cancel' onClick={handleAction}>Cancel</StyledButton>
            <StyledButton fullWidth loading={onProgress} needLoading={true} value='ok' onClick={handleAction}>Yes</StyledButton>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default DeletePost