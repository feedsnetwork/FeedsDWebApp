import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, Typography, Stack} from '@mui/material';
import { useSnackbar } from 'notistack';

import StyledButton from '../StyledButton';
import StyledIcon from '../StyledIcon'
import { HiveApi } from 'services/HiveApi'
import { handleUnsubscribeModal, selectTargetChannel, selectUnsubscribeModalState } from 'redux/slices/channel';
import { getLocalDB } from 'utils/db';

function Unsubscribe() {
  const [onProgress, setOnProgress] = React.useState(false);
  const dispatch = useDispatch()
  const isOpen = useSelector(selectUnsubscribeModalState)
  const channel = useSelector(selectTargetChannel)

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
      hiveApi.unSubscribeChannel(channel?.target_did, channel?.channel_id)
        .then(_=>{
          LocalDB.upsert(channel?.channel_id, (doc)=>{
            if(doc._id) {
              doc['is_subscribed'] = false
              return doc
            }
            return false
          })
          enqueueSnackbar('Unsubscribe channel success', { variant: 'success' });
          setOnProgress(false)
          handleClose()
        })
        .catch(err=>{
          enqueueSnackbar('Unsubscribe channel error', { variant: 'error' });
        })
    } else {
      handleClose()
    }
  }

  const handleClose = () => {
    handleUnsubscribeModal(false)(dispatch)
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} onClick={(e)=>{e.stopPropagation()}}>
      <DialogContent sx={{minWidth: {sm: 'unset', md: 400}}}>
        <Stack spacing={2} sx={{textAlign: 'center'}}>
          <Typography variant="h5">Unsubscribe Channel</Typography>
          <StyledIcon icon="clarity:user-solid-alerted" width={64} height={64}/>
          <Typography variant="body2">Are you sure you want to unsubscribe this channel?</Typography>
          <Stack direction="row" spacing={3}>
            <StyledButton type="outlined" fullWidth value='cancel' onClick={handleAction}>Cancel</StyledButton>
            <StyledButton fullWidth loading={onProgress} needLoading={true} value='ok' onClick={handleAction}>Yes</StyledButton>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default Unsubscribe