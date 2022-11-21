import React from 'react';
import { Dialog, DialogContent, Typography, Stack } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux'
import { useSnackbar } from 'notistack';

import StyledButton from '../StyledButton';
import StyledAvatar from '../StyledAvatar';
import { CHANNEL_REG_CONTRACT_ABI } from 'abi/ChannelRegistry';
import { ChannelRegContractAddress } from 'config'
import { SidebarContext } from 'contexts/SidebarContext';
import { selectTargetChannel, selectUnpublishModalState, handleUnpublishModal } from 'redux/slices/channel'
import { getWeb3Contract, getWeb3Connect } from 'utils/common'
import { getLocalDB } from 'utils/db';

function UnpublishChannel() {
  const { increaseUpdatingChannelNumber } = React.useContext(SidebarContext)
  const dispatch = useDispatch()
  const isOpen = useSelector(selectUnpublishModalState)
  const channel = useSelector(selectTargetChannel)
  const channelTokenId = channel?.tokenId
  const [onProgress, setOnProgress] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const LocalDB = getLocalDB()

  React.useEffect(()=>{
    if(!isOpen) {
      setOnProgress(false)
    }
  }, [isOpen])

  const promiseReceipt = (method) => (
    new Promise((resolve, reject) => {
      method
      .on('receipt', (receipt) => {
        resolve(receipt)
      })
      .on('error', (error) => {
        console.error("error", error);
        reject(error)
      })
    })
  )
  const handleAction = async (e) => {
    if(e.currentTarget.value === 'ok') {
      setOnProgress(true)
      try {
        const channelRegContract = getWeb3Contract(CHANNEL_REG_CONTRACT_ABI, ChannelRegContractAddress)
        const web3Connect = getWeb3Connect()
        const accounts = await web3Connect.eth.getAccounts()
        const gasPrice = await web3Connect.eth.getGasPrice()
        const _gasLimit = 5000000;
        const transactionParams = {
          'from': accounts[0],
          'gasPrice': gasPrice,
          'gas': _gasLimit,
          'value': 0
        };
        const burnMethod = channelRegContract.methods.burn(channelTokenId).send(transactionParams)
        await promiseReceipt(burnMethod)
        LocalDB.upsert(channel.channel_id, (doc)=>{
          doc['is_public'] = false
          return doc
        })
          .then(_=>increaseUpdatingChannelNumber())
        enqueueSnackbar('Unpublish channel success', { variant: 'success' });
        setOnProgress(false)
        handleClose()
      } catch(err) {
        setOnProgress(false)
        enqueueSnackbar('Unpublish channel error', { variant: 'error' });
      }
    } else {
      handleClose()
    }
  }

  const handleClose = () => {
    handleUnpublishModal(false)(dispatch)
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} onClick={(e)=>{e.stopPropagation()}}>
      <DialogContent sx={{minWidth: {sm: 'unset', md: 400}}}>
        <Stack spacing={2} sx={{textAlign: 'center'}}>
          <Typography variant="h5">Unpublish Channel</Typography>
          <Stack spacing={1} alignItems="center">
            <StyledAvatar alt={channel.name} src={channel.avatarPreview} width={64}/>
            <Typography variant="subtitle2">{channel.name}</Typography>
          </Stack>
          <Typography variant="body2">
            You are about to unpublish channel
          </Typography>
          {
            !onProgress?
            <Stack direction="row" spacing={3}>
              <StyledButton type="outlined" fullWidth value='cancel' onClick={handleAction}>Cancel</StyledButton>
              <StyledButton fullWidth value='ok' onClick={handleAction}>Yes</StyledButton>
            </Stack>:

            <Stack direction="row" spacing={3}>
              <StyledButton loadingPosition="start" startIcon={<div/>} type="outlined" fullWidth loading={onProgress} needLoading={true} sx={{color: 'inherit !important'}}>
                Please Sign Transaction From Wallet
              </StyledButton>
            </Stack>
          }
          <Typography variant="body2">
            We do not own your private keys and cannot access your funds without your confirmation.
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default UnpublishChannel