import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Box, Stack, Divider, IconButton, Paper } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux'
import { useSnackbar } from 'notistack';
import { create } from 'ipfs-http-client'

import StyledButton from '../StyledButton';
import StyledIcon from '../StyledIcon'
import StyledAvatar from '../StyledAvatar';
import { HiveApi } from 'src/services/HiveApi'
import { ChannelContent } from 'src/models/channel_content';
import { CHANNEL_REG_CONTRACT_ABI } from 'src/abi/ChannelRegistry';
import { ipfsURL, ChannelRegContractAddress } from 'src/config'
import { selectPublishModalState, selectCreatedChannel, handlePublishModal } from 'src/redux/slices/channel'
import { getBufferFromUrl, getWeb3Contract, getWeb3Connect, decFromHex, hash } from 'src/utils/common'

const client = create({url: ipfsURL})
function PublishChannel() {
  const dispatch = useDispatch()
  const isOpen = useSelector(selectPublishModalState)
  const channel = useSelector(selectCreatedChannel)
  const [onProgress, setOnProgress] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const userDid = `did:elastos:${feedsDid}`

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
        const avatarBuffer = Buffer.from(channel.avatarContent, 'base64');
        console.log(avatarBuffer, "test------")
        const avatarAdded = await client.add(avatarBuffer)
        const metaObj = new ChannelContent()
        metaObj.name = channel.name
        metaObj.description = channel.description
        metaObj.creator['did'] = userDid
        metaObj.data.cname = channel.name
        metaObj.data.avatar = `feeds:image:${avatarAdded.path}`
        metaObj.data.ownerDid = userDid
        const metaAdded = await client.add(JSON.stringify(metaObj))
        const channelID = hash(`${userDid}${channel.name}`)
        const channelEntry = `feeds://v3/${userDid}/${channelID}`
        const tokenID = decFromHex(channelID)
        const tokenURI = `feeds:json:${metaAdded.path}`
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
        const mintMethod = channelRegContract.methods.mint(tokenID, tokenURI, channelEntry, accounts[0], accounts[0]).send(transactionParams)
        const mintResult = await promiseReceipt(mintMethod)
        enqueueSnackbar('Publish channel success', { variant: 'success' });
        setOnProgress(false)
        handleClose()
      } catch(err) {
        setOnProgress(false)
        enqueueSnackbar('Publish channel error', { variant: 'error' });
      }
      
    } else {
      handleClose()
    }
  }

  const handleClose = () => {
    handlePublishModal(false)(dispatch)
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} onClick={(e)=>{e.stopPropagation()}}>
      <DialogContent sx={{minWidth: {sm: 'unset', md: 400}}}>
        <Stack spacing={2} sx={{textAlign: 'center'}}>
          <Typography variant="h5">Publish Channel</Typography>
          <Stack spacing={1} alignItems="center">
            <StyledAvatar alt={channel.name} src={channel.avatarPreview} width={64}/>
            <Typography variant="subtitle2">{channel.name}</Typography>
          </Stack>
          <Typography variant="body2">
            This action requires an interaction with the smart contract. 
            A small transaction fee is required for registering the channel onto the Elastos Smart Chain.
            Do you still want to continue?
          </Typography>
          <Stack direction="row" spacing={3}>
            <StyledButton type="outlined" fullWidth value='cancel' onClick={handleAction}>Cancel</StyledButton>
            <StyledButton fullWidth loading={onProgress} needLoading={true} value='ok' onClick={handleAction}>Yes</StyledButton>
          </Stack>
          <Typography variant="body2">
            We do not own your private keys and cannot access your funds without your confirmation.
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default PublishChannel