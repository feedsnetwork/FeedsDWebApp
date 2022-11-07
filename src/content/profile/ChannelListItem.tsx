import React from 'react';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Box, Typography, Stack, Hidden, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useSnackbar } from 'notistack';

import IconInCircle from 'components/IconInCircle'
import StyledAvatar from 'components/StyledAvatar'
import { handlePublishModal, handleUnpublishModal, selectSubscribers, setCreatedChannel } from 'redux/slices/channel';
import { getChannelShortUrl, copy2clipboard, decodeBase64 } from 'utils/common'

const ChannelListItem = (props) => {
  const {channel, publishTokenId} = props
  const {name, avatarSrc, intro} = channel
  const avatarImg = decodeBase64(avatarSrc)
  const [isOpenPopup, setOpenPopup] = React.useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const subscribersOfChannel = useSelector(selectSubscribers)
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
        dispatch(setCreatedChannel(channelObj))
        break;
      }
      case 'unpublish': {
        const channelObj = {...channel, tokenId: publishTokenId, avatarPreview: avatarImg}
        handleUnpublishModal(true)(dispatch)
        dispatch(setCreatedChannel(channelObj))
        break;
      }
      default:
        break;
    }
    setOpenPopup(null);
  };

  const subscriberCount = subscribersOfChannel[channel.channel_id]?.length || 0
  return <Card sx={{background: (theme)=>theme.palette.primary.main, p: 2}}>
    <Stack direction="row" spacing={2} alignItems="center">
      <StyledAvatar alt={name} src={avatarImg}/>
      <Box flex={1}>
        <Hidden mdDown>
          <Typography variant="subtitle2">{name}</Typography>
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
            {
              !publishTokenId?
              <MenuItem value='publish' onClick={handleClosePopup}>
                <IconInCircle name='fa6-solid:earth-americas'/>&nbsp;
                <Typography variant="subtitle2" color="#FF453A">Publish Channel</Typography>
              </MenuItem>:

              <MenuItem value='unpublish' onClick={handleClosePopup}>
                <IconInCircle name='fa6-solid:earth-americas'/>&nbsp;
                <Typography variant="subtitle2" color="#FF453A">Unpublish Channel</Typography>
              </MenuItem>
            }
          </Menu>
        </Box>
      }
    </Stack>
    <Hidden mdUp>
      <Box mt={1}>
        <Typography variant="subtitle2">{channel.name}</Typography>
        <Typography variant="body2">{channel.intro}</Typography>
        <Stack direction="row" sx={{flexWrap: 'wrap', mt: 1}}>
          <Typography variant="body2" pr={3}><strong>{subscriberCount}</strong> Subscribers</Typography>
        </Stack>
      </Box>
    </Hidden>
  </Card>
}

export default ChannelListItem;
