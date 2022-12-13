import React from 'react';
import { Dialog, DialogContent, Typography, Stack } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux'
import { useSnackbar } from 'notistack';
import { create } from 'ipfs-http-client'

import StyledButton from '../StyledButton';
import ChannelName from 'components/ChannelName';
import NoRingAvatar from 'components/NoRingAvatar';
import { ChannelContent } from 'models/channel_content';
import { CHANNEL_REG_CONTRACT_ABI } from 'abi/ChannelRegistry';
import { ipfsURL, ChannelRegContractAddress } from 'config'
import { selectPublishModalState, selectTargetChannel, handlePublishModal, setChannelData } from 'redux/slices/channel'
import { HiveHelper } from 'services/HiveHelper';
import { getWeb3Contract, getWeb3Connect, decFromHex, hash, getIpfsUrl, hexFromDec } from 'utils/common'
import { getLocalDB } from 'utils/db';

const client = create({url: ipfsURL})
function PublishChannel() {
  const dispatch = useDispatch()
  const isOpen = useSelector(selectPublishModalState)
  const channel = useSelector(selectTargetChannel)
  const [onProgress, setOnProgress] = React.useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const feedsDid = localStorage.getItem('FEEDS_DID')
  const userDid = `did:elastos:${feedsDid}`
  const LocalDB = getLocalDB()
  const hiveHelper = new HiveHelper()

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
        reject(error)
      })
    })
  )
  const handleAction = async (e) => {
    if(e.currentTarget.value === 'ok') {
      setOnProgress(true)
      try {
        // set channel data 
        const avatarBuffer = Buffer.from(channel.avatarContent, 'base64');
        const avatarAdded = await client.add(avatarBuffer)
        const metaObj = new ChannelContent()
        metaObj.name = channel.name
        metaObj.description = channel.intro
        metaObj.creator['did'] = userDid
        metaObj.data.cname = channel.display_name || channel.name
        metaObj.data.avatar = `feeds:image:${avatarAdded.path}`
        metaObj.data.ownerDid = userDid
        const channelID = hash(`${userDid}${channel.name}`)
        const channelEntry = `feeds://v3/${userDid}/${channelID}`
        metaObj.data.channelEntry = channelEntry
        const tokenID = decFromHex(channelID)

        // request sign data
        const signData = await hiveHelper.requestSigndata(channelEntry)
        if(!signData.signature) {
          setOnProgress(false)
          enqueueSnackbar('Publish channel error', { variant: 'error' });
          return
        }
        metaObj.data.signature = signData.signature
        
        // upload data to ipfs
        const metaAdded = await client.add(JSON.stringify(metaObj))
        const tokenURI = `feeds:json:${metaAdded.path}`

        // publish data
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
        const mintMethod = channelRegContract.methods.mint(tokenID, tokenURI, channelEntry, channel.tipping_address).send(transactionParams)
        const mintRes = await promiseReceipt(mintMethod)
        const tokenId = `0x${hexFromDec(mintRes['events']?.ChannelRegistered?.returnValues.tokenId || '0')}`
        const channelDoc = {
          channel_id: channelID,
          name: metaObj.name,
          display_name: channel.display_name || channel.name,
          intro: metaObj.description,
          target_did: metaObj.creator['did'], 
          tipping_address: channel.tipping_address,
          type: metaObj.type,
          is_public: true,
          time_range: [], 
          avatarSrc: getIpfsUrl(metaObj?.data?.avatar),
          banner: metaObj?.data?.banner,
          table_type: 'channel',
          tokenId
        }
        LocalDB.upsert(channelID, (doc)=>{
          if(doc._id) {
            if(!doc['is_public']){
                doc['is_public'] = true
                doc['tokenId'] = tokenId
                return doc
            }
            return false
          }
          return {...doc, ...channelDoc}
        })
          .then(_=>{
            const updateObj = {}
            updateObj[channelID] = {is_public: true}
            dispatch(setChannelData(updateObj))
          })
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
            <NoRingAvatar alt={channel.display_name} src={channel.avatarPreview} width={64}/>
            <ChannelName name={channel.display_name} isPublic={channel['is_public']}/>
          </Stack>
          {
            !onProgress &&
            <Typography variant="body2">
              This action requires an interaction with the smart contract. 
              A small transaction fee is required for registering the channel onto the Elastos Smart Chain.
              Do you still want to continue?
            </Typography>
          }
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

export default PublishChannel