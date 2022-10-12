import React from 'react';
import { useDispatch } from 'react-redux';
import { Card, Box, Typography, Stack, Hidden, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useSnackbar } from 'notistack';

import StyledButton from 'components/StyledButton'
import IconInCircle from 'components/IconInCircle'
import StyledAvatar from 'components/StyledAvatar'
import { SidebarContext } from 'contexts/SidebarContext';
import { HiveApi } from 'services/HiveApi'
import { handlePublishModal, setCreatedChannel } from 'redux/slices/channel';
import { getChannelShortUrl, copy2clipboard } from 'utils/common'

const ChannelListItem = (props) => {
  const {channel} = props
  const { selfChannels } = React.useContext(SidebarContext);
  const [subscribers, setSubscribers] = React.useState([])
  const [isOpenPopup, setOpenPopup] = React.useState(null);
  const hiveApi = new HiveApi()
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const userDid = `did:elastos:${feedsDid}`
  const isOwnedChannel = selfChannels.findIndex(item=>item.channel_id==channel.channel_id)>=0
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch()

  React.useEffect(()=>{
    hiveApi.querySubscriptionInfoByChannelId(userDid, channel.channel_id)
      .then(res=>{
        if(res['find_message'])
          setSubscribers(res['find_message']['items'])
        console.log(res, "===========1")
      })
  }, [])

  const openPopupMenu = (event) => {
    setOpenPopup(event.currentTarget);
  };

  const handleClosePopup = (event) => {
    const type = event.currentTarget.getAttribute("value")
    switch(type){
      case 'share':
        getChannelShortUrl(channel)
          .then(shortUrl=>{
            copy2clipboard(shortUrl)
              .then(_=>{
                enqueueSnackbar('Copied to clipboard', { variant: 'success' });
              })
          })
        break;
      case 'edit':
        // setOpenPost(true)
        break;
      case 'publish':
        const splitAvatarContent = channel.avatarSrc.split(';base64,')
        const channelObj = {...channel, avatarContent: splitAvatarContent[splitAvatarContent.length-1], avatarPreview: channel.avatarSrc}
        handlePublishModal(true)(dispatch)
        dispatch(setCreatedChannel(channelObj))
        break;
      default:
        break;
    }
    setOpenPopup(null);
  };

  return <Card sx={{background: (theme)=>theme.palette.primary.main, p: 2}}>
    <Stack direction="row" spacing={2} alignItems="center">
      <StyledAvatar alt={channel.name} src={channel.avatarSrc}/>
      <Box flex={1}>
        <Hidden mdDown>
          <Typography variant="subtitle2">{channel.name}</Typography>
          <Typography variant="body2">{channel.intro}</Typography>
          <Stack direction="row" sx={{flexWrap: 'wrap', mt: 1}}>
            <Typography variant="body2" pr={3}><strong>{subscribers.length}</strong> Subscribers</Typography>
          </Stack>
        </Hidden>
      </Box>
      {
        isOwnedChannel &&
        <Box sx={{mb: 'auto !important'}}>
          <IconButton aria-label="settings" size='small' onClick={openPopupMenu}>
            <MoreVertIcon />
          </IconButton>
          <Menu 
            keepMounted
            id="simple-menu"
            anchorEl={isOpenPopup}
            onClick={(e)=>{e.stopPropagation()}}
            onClose={handleClosePopup}
            open={Boolean(isOpenPopup)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem value='share' onClick={handleClosePopup}>
              <IconInCircle name='clarity:share-line'/>&nbsp;
              <Typography variant="subtitle2">Copy Link to Share</Typography>
            </MenuItem>
            <MenuItem value='edit' onClick={handleClosePopup}>
              <IconInCircle name='clarity:note-edit-line'/>&nbsp;
              <Typography variant="subtitle2">Edit Channel</Typography>
            </MenuItem>
            <MenuItem value='publish' onClick={handleClosePopup}>
              <IconInCircle name='fa6-solid:earth-americas'/>&nbsp;
              <Typography variant="subtitle2" color="#FF453A">Publish Channel</Typography>
            </MenuItem>
          </Menu>
        </Box>
      }
      {/* <StyledButton type="outlined" size="small" sx={{height: 'fit-content'}}>Edit Channel</StyledButton> */}
    </Stack>
    <Hidden mdUp>
      <Box mt={1}>
        <Typography variant="subtitle2">{channel.name}</Typography>
        <Typography variant="body2">{channel.intro}</Typography>
        <Stack direction="row" sx={{flexWrap: 'wrap', mt: 1}}>
          <Typography variant="body2" pr={3}><strong>{subscribers.length}</strong> Subscribers</Typography>
        </Stack>
      </Box>
    </Hidden>
  </Card>
}

export default ChannelListItem;
