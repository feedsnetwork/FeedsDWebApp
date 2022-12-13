import React from 'react';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { Card, Box, Typography, Stack, Hidden, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useSnackbar } from 'notistack';

import IconInCircle from 'components/IconInCircle'
import ChannelName from 'components/ChannelName';
import NoRingAvatar from 'components/NoRingAvatar';
import { handlePublishModal, handleUnpublishModal, setFocusedChannelId, setTargetChannel, setVisitedChannelId } from 'redux/slices/channel';
import { getChannelShortUrl, copy2clipboard, getImageSource } from 'utils/common'

const ChannelListItem = (props) => {
  const {channel} = props
  const {display_name: name, avatarSrc, intro, is_public} = channel
  const avatarImg = getImageSource(avatarSrc)
  const [isOpenPopup, setOpenPopup] = React.useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch()
  const navigate = useNavigate()
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
        navigate(`/channel/edit/${channel['channel_id']}`);
        break;
      case 'publish': {
        const splitAvatarContent = avatarSrc.split(';base64,')
        const channelObj = {...channel, avatarContent: splitAvatarContent[splitAvatarContent.length-1], avatarPreview: avatarImg}
        handlePublishModal(true)(dispatch)
        dispatch(setTargetChannel(channelObj))
        break;
      }
      case 'unpublish': {
        const channelObj = {...channel, avatarPreview: avatarImg}
        handleUnpublishModal(true)(dispatch)
        dispatch(setTargetChannel(channelObj))
        break;
      }
      default:
        break;
    }
    setOpenPopup(null);
  };

  const link2channel = ()=>{
    if(channel['is_self']) {
      dispatch(setFocusedChannelId(channel['channel_id']))
      navigate('/channel')
    }
    else if(channel['is_subscribed']) {
      dispatch(setVisitedChannelId(channel['channel_id']))
      navigate('/subscription/channel');
    }
    else {
      dispatch(setVisitedChannelId(channel['channel_id']))
      navigate('/explore/channel');
    }
  }
  const subscriberCount = channel['subscribers']?.length || 0
  return <Card sx={{background: (theme)=>theme.palette.primary.main, p: 2, cursor: 'pointer'}} onClick={link2channel}>
    <Stack direction="row" spacing={2} alignItems="center">
      <NoRingAvatar alt={name} src={avatarImg}/>
      <Box flex={1}>
        <Hidden mdDown>
          <ChannelName name={name} isPublic={is_public} variant="subtitle2"/>
          <Typography variant="body2">{intro}</Typography>
          <Stack direction="row" sx={{flexWrap: 'wrap', mt: 1}}>
            <Typography variant="body2" pr={3}><strong>{subscriberCount}</strong> Subscribers</Typography>
          </Stack>
        </Hidden>
      </Box>
      {
        channel['is_self'] &&
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
            <MenuItem value={channel['is_public']? 'unpublish': 'publish'} onClick={handleClosePopup}>
              <IconInCircle name='fa6-solid:earth-americas'/>&nbsp;
              <Typography variant="subtitle2" color="#FF453A">{channel['is_public']? 'Unpublish': 'Publish'} Channel</Typography>
            </MenuItem>
          </Menu>
        </Box>
      }
    </Stack>
    <Hidden mdUp>
      <Box mt={1}>
        <ChannelName name={name} isPublic={is_public} variant="subtitle2"/>
        <Typography variant="body2">{channel.intro}</Typography>
        <Stack direction="row" sx={{flexWrap: 'wrap', mt: 1}}>
          <Typography variant="body2" pr={3}><strong>{subscriberCount}</strong> Subscribers</Typography>
        </Stack>
      </Box>
    </Hidden>
  </Card>
}

export default ChannelListItem;
