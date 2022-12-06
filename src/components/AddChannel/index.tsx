import { FC, useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { Icon } from '@iconify/react';
import { create } from 'ipfs-http-client'
import { Box, Typography, Stack, Card, Input, IconButton, Grid, styled, FormControl, FormHelperText } from '@mui/material';

import StyledButton from 'components/StyledButton';
import { ChannelContent } from 'models/channel_content';
import { handleSuccessModal, setTargetChannel, setChannelData, selectSelfChannels } from 'redux/slices/channel';
import { selectMyName } from 'redux/slices/user';
import { HiveApi } from 'services/HiveApi'
import { compressImage, decFromHex, decodeBase64, encodeBase64, getBufferFromFile, getWeb3Connect, getWeb3Contract, hexFromDec } from 'utils/common'
import { getLocalDB } from 'utils/db';
import { ChannelRegContractAddress, ipfsURL } from 'config';
import { CHANNEL_REG_CONTRACT_ABI } from 'abi/ChannelRegistry';
import { HiveHelper } from 'services/HiveHelper';

const AvatarWrapper = styled(Box)(
  ({ theme }) => `
    position: relative;
    overflow: visible;
    display: inline-block;
`
);

const ButtonUploadWrapper = styled(Box)(
  ({ theme }) => `
    position: absolute;
    width: ${theme.spacing(4)};
    height: ${theme.spacing(4)};
    bottom: -${theme.spacing(0)};
    right: -${theme.spacing(0)};

    .MuiIconButton-root {
      border-radius: 100%;
      background: ${theme.colors.primary.main};
      color: ${theme.palette.primary.contrastText};
      width: ${theme.spacing(4)};
      height: ${theme.spacing(4)};
      padding: 0;
  
      &:hover {
        background: ${theme.colors.primary.dark};
      }
    }
`
);

const AvatarInput = styled('input')({
  display: 'none'
});

interface AddChannelProps {
  action?: string;
}
const client = create({url: ipfsURL})
const AddChannel: FC<AddChannelProps> = (props)=>{
  const { action='add' } = props
  const params = useParams(); // params.key
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tipping, setTipping] = useState('');
  const [isOnValidation, setOnValidation] = useState(false);
  const [onProgress, setOnProgress] = useState(false);
  const [originChannel, setOriginChannel] = useState({});
  const selfChannels = useSelector(selectSelfChannels) || {}
  const selfChannelNames = Object.values(selfChannels).filter(c=>c['channel_id']!==params.channelId).map(c=>c['display_name'])
  const nameRef = useRef(null)
  const descriptionRef = useRef(null)
  const tippingRef = useRef(null)
  const feedsDid = localStorage.getItem('FEEDS_DID')
  const myDID = `did:elastos:${feedsDid}`
  const hiveApi = new HiveApi()
  const hiveHelper = new HiveHelper()
  const LocalDB = getLocalDB()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const myName = useSelector(selectMyName)
  const { enqueueSnackbar } = useSnackbar();

  useEffect(()=>{
    if(action === 'edit') {
      LocalDB.get(params.channelId)
        .then(doc=>{
          setOriginChannel(doc)
          setName(doc['display_name'] || doc['name'])
          setDescription(doc['intro'])
          setTipping(doc['tipping_address'])
          setAvatarUrl(decodeBase64(doc['avatarSrc'] || ''))
        })
    }
    else {
      setName('')
      setDescription('')
      setTipping('')
      setAvatarUrl(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.channelId, action])

  const handleFileChange = event => {
    const fileObj = event.target.files && event.target.files[0];
    if (fileObj) {
      const tempFileObj = Object.assign(fileObj, {preview: URL.createObjectURL(fileObj)})
      setAvatarUrl(tempFileObj);
    }
  };

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
  const saveAction = async (e) => {
    setOnValidation(true)
    if(!avatarUrl)
      return
    if(!name) {
      nameRef.current.focus()
      return
    }
    if(selfChannelNames.includes(name)) {
      nameRef.current.focus()
      return
    }
    if(!description) {
      descriptionRef.current.focus()
      return
    }
    if(!tipping) {
      tippingRef.current.focus()
      return
    }

    setOnProgress(true)
    const newChannel = {
      name: name,
      intro: description,
      avatar: originChannel['avatar'],
      avatarPreview: avatarUrl['preview'],
      tippingAddr: tippingRef.current.value
    }
    let avatarContent = ''
    let imageBuffer = null
    if(avatarUrl && typeof avatarUrl === 'object') {
      imageBuffer = await getBufferFromFile(avatarUrl) as Buffer
      const base64content = imageBuffer.toString('base64')
      avatarContent = `data:${avatarUrl.type};base64,${base64content}`
      const imageHivePath = await hiveApi.uploadMediaDataWithString(avatarContent)
      newChannel['avatar'] = imageHivePath || originChannel['avatar']
      newChannel['avatarContent'] = base64content
    }
    if(action === 'edit')
      hiveApi.updateChannel(originChannel['channel_id'], newChannel.name, newChannel.intro, newChannel['avatar'], originChannel['type'], originChannel['memo'], newChannel.tippingAddr, originChannel['nft'])
        .then(_=>{
          if(newChannel['avatar'] === originChannel['avatar'])
            return ''
          return compressImage(avatarContent)
        })
        .then(newAvatarSrc=>(
          LocalDB.upsert(params.channelId, (doc)=>{
            const updateObj = {}
            updateObj[params.channelId] = {
              display_name: newChannel.name,
              intro: newChannel.intro,
              tipping_address: newChannel.tippingAddr,
            }
            if(newAvatarSrc) {
              updateObj[params.channelId]['avatar'] = newChannel['avatar']
              updateObj[params.channelId]['avatarSrc'] = encodeBase64(newAvatarSrc)
            }
            dispatch(setChannelData(updateObj))
            return { ...doc, ...updateObj[params.channelId] }
          })
        ))
        .then(async _=>{
          if(!originChannel['is_public'])
            return
          const metaObj = new ChannelContent()
          if(imageBuffer) {
            const avatarAdded = await client.add(imageBuffer)
            metaObj.data.avatar = `feeds:image:${avatarAdded.path}`
          }
          else
            metaObj.data.avatar = originChannel['avatar']
          metaObj.name = newChannel.name
          metaObj.description = newChannel.intro
          metaObj.creator['did'] = myDID
          metaObj.data.cname = newChannel.name
          metaObj.data.ownerDid = myDID
          const channelEntry = `feeds://v3/${myDID}/${originChannel['channel_id']}`
          metaObj.data.channelEntry = channelEntry
          const tokenID = decFromHex(originChannel['channel_id'])
          // request sign data
          const signData = await hiveHelper.requestSigndata(channelEntry)
          if(!signData.signature) {
            setOnProgress(false)
            enqueueSnackbar('Edit public channel error', { variant: 'error' });
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
          const mintMethod = channelRegContract.methods.updateChannel(tokenID, tokenURI, channelEntry, newChannel.tippingAddr).send(transactionParams)
          const mintRes = await promiseReceipt(mintMethod)
          const tokenId = `0x${hexFromDec(mintRes['events']?.ChannelRegistered?.returnValues.tokenId || '0')}`
          return LocalDB.upsert(params.channelId, (doc)=>{
            if(doc._id) {
              const updateObj = {}
              updateObj[params.channelId] = {tokenId: tokenId}
              dispatch(setChannelData(updateObj))
              doc['tokenId'] = tokenId
              return doc
            }
          })
        })
        .then(_=>{
          setOnProgress(false)
          enqueueSnackbar('Edit channel success', { variant: 'success' });
        })
        .catch(error=>{
          enqueueSnackbar('Edit channel error', { variant: 'error' });
          setOnProgress(false)
        })
    else
      hiveApi.createChannel(newChannel.name, newChannel.intro, newChannel['avatarPath'], newChannel.tippingAddr)
        .then(async result=>{
          const currentTime = new Date().getTime()
          await hiveApi.subscribeChannel(myDID, result.channelId, myName, currentTime)
          const newSubscriber = {
            channel_id: result.channelId,
            created_at: currentTime,
            display_name: myName,
            status: 0,
            updated_at: currentTime,
            user_did: myDID
          }
          // enqueueSnackbar('Add channel success', { variant: 'success' });
          setOnProgress(false)
          handleSuccessModal(true)(dispatch)
          dispatch(setTargetChannel(newChannel))
          const zipAvatarContent = await compressImage(avatarContent)
          hiveApi.queryChannelInfo(myDID, result.channelId)
            .then(res=>{
              if(res['find_message'] && res['find_message']['items'].length) {
                const channelInfo = res['find_message']['items'][0]
                const newChannelDoc = {
                  ...channelInfo,
                  _id: channelInfo['channel_id'], 
                  target_did: myDID,
                  is_self: true, 
                  is_subscribed: true, 
                  time_range: [], 
                  table_type: 'channel',
                  avatarSrc: encodeBase64(zipAvatarContent),
                  owner_name: myName || "",
                  subscribers: [newSubscriber],
                  display_name: newChannel.name
                }
                const subscribersObj = {}
                subscribersObj[newChannelDoc.channel_id] = newChannelDoc
                dispatch(setChannelData(subscribersObj))
                return LocalDB.put(newChannelDoc)
              }
            })
            .then(_=>{
              navigate('/channel')
            })
        })
        .catch(error=>{
          enqueueSnackbar('Add channel error', { variant: 'error' });
          setOnProgress(false)
        })
  }

  let avatarSrc = '/user-circle.svg'
  if(avatarUrl) {
    if(typeof avatarUrl === 'object')
      avatarSrc = avatarUrl.preview
    else avatarSrc = avatarUrl
  }
  return (
    <Box p={4}>
      {
        selfChannels.length>=5 && action==="add"?
        <Stack alignItems='center'>
          <Box component='img' src='/post-chat.svg' width={{xs: 50, md: 65, lg: 80}} pt={{xs: 1, sm: 2}} pb={{xs: 1, sm: 2}}/>
          <Typography variant='h4' align='center'>
            Creating channel is restricted
          </Typography>
          <Stack spacing={4}>
            <Typography variant='body2' component="pre" sx={{opacity: .8}} align='center'>
              Users are allowed to create channels up to 5.
            </Typography>
          </Stack>
        </Stack>:

        <Card sx={{ p: 3 }}>
          <Stack spacing={6} alignItems='center'>
            <AvatarWrapper>
              <Box component='img' src={avatarSrc} draggable={false} sx={{ width: 90, height: 90, borderRadius: '50%'}}/>
              <ButtonUploadWrapper>
                <AvatarInput
                  accept="image/*"
                  id="icon-button-file"
                  name="icon-button-file"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="icon-button-file">
                  <IconButton component="span" color="primary">
                    <Icon icon="akar-icons:edit" />
                  </IconButton>
                </label>
              </ButtonUploadWrapper>
            </AvatarWrapper>
            {
              isOnValidation && !avatarUrl &&
              <FormControl error={true} variant="standard" sx={{width: '100%', mt: '0px !important', alignItems: 'center'}}>
                <FormHelperText id="avatar-error-text">Avatar file is required</FormHelperText>
              </FormControl>
            }
            <Grid container direction="column">
              <Grid item>
                <Typography variant='subtitle1'>Name</Typography>
                <FormControl error={isOnValidation&&(!name.length||selfChannelNames.includes(name))} variant="standard" sx={{width: '100%'}}>
                  <Input 
                    placeholder="Add channel name" 
                    fullWidth 
                    inputRef={nameRef}
                    value={name}
                    onChange={(e)=>{setName(e.target.value)}}
                  />
                  <FormHelperText id="name-error-text" hidden={!isOnValidation||(isOnValidation&&name.length>0)}>Name is required</FormHelperText>
                  <FormHelperText id="name-error-text" hidden={!isOnValidation||(isOnValidation&&!selfChannelNames.includes(name))}>Name is duplicated</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item py={2}>
                <Typography variant='subtitle1'>Description</Typography>
                <FormControl error={isOnValidation&&!description.length} variant="standard" sx={{width: '100%'}}>
                  <Input 
                    placeholder="Add channel description" 
                    fullWidth 
                    inputRef={descriptionRef}
                    value={description}
                    onChange={(e)=>{setDescription(e.target.value)}}
                  />
                  <FormHelperText id="description-error-text" hidden={!isOnValidation||(isOnValidation&&description.length>0)}>Description is required</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item>
                <Typography variant='subtitle1'>Tipping Address</Typography>
                <FormControl error={isOnValidation&&!tipping.length} variant="standard" sx={{width: '100%'}}>
                  <Input 
                    placeholder="Enter tipping address" 
                    fullWidth 
                    inputRef={tippingRef}
                    value={tipping}
                    onChange={(e)=>{setTipping(e.target.value)}}
                  />
                  <FormHelperText id="description-error-text" hidden={!isOnValidation||(isOnValidation&&tipping.length>0)}>Tipping Address is required</FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
            <Box width={200}>
              <StyledButton fullWidth loading={onProgress} needLoading={true} onClick={saveAction}>{action!=='edit'? 'Create': 'Save'}</StyledButton>
            </Box>
          </Stack>
        </Card>
      }
    </Box>
  );
}
export default AddChannel;