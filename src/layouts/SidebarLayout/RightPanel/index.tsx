import React, { useContext } from 'react';
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { Icon } from '@iconify/react';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import ShareIcon from '@mui/icons-material/ShareOutlined';
import { Stack, Box, styled, useTheme, Button, Card, CardHeader, CardContent, List, ListItem, ListItemText, 
  InputAdornment, Typography, Grid, IconButton } from '@mui/material';

import Scrollbar from 'components/Scrollbar';
import StyledAvatar from 'components/StyledAvatar'
import StyledButton from 'components/StyledButton'
import InputOutline from 'components/InputOutline'
import SubscriberListItem from './SubscriberListItem';
import { SidebarContext } from 'contexts/SidebarContext';
import { selectPublicChannels, selectDispNameOfChannels, selectFocusedChannelId, selectVisitedChannelId, selectSubscribers, selectChannelAvatar } from 'redux/slices/channel';
import { reduceHexAddress, reduceDIDstring, decodeBase64 } from 'utils/common'
import { LocalDB } from 'utils/db'

const SidebarWrapper = styled(Box)(
  ({ theme }) => `
        width: ${theme.rightPanel.width};
        min-width: ${theme.rightPanel.width};
        color: ${theme.colors.alpha.trueWhite[70]};
        position: relative;
        z-index: 7;
        height: 100%;
`
);
const ListWrapper = styled(List)(
  () => `
      .MuiListItem-root {
        border-radius: 0;
        margin: 0;
      }
`
);
const ChannelAbout = (props) => {
  const { this_channel } = props
  const editable = this_channel['is_self']
  return <>
    <Card>
      <CardContent>
        <Stack alignItems='end'>
          <Stack direction='row' spacing={1}>
            <Box m='auto'>
              <IconButton sx={{borderRadius: '50%', backgroundColor: (theme)=>theme.colors.primary.main}} size='small'><ShareIcon fontSize='small'/></IconButton>
            </Box>
            {
              editable &&
              <StyledButton type='outlined' size='small'>Edit channel</StyledButton>
            }
          </Stack>
        </Stack>
        <Stack alignItems='center' my={2}>
          <StyledAvatar alt={this_channel.name} src={this_channel.avatarSrc} width={60}/>
          <Typography variant='h5' mt={1}>{this_channel.name}</Typography>
          <Typography variant='body2'>@{this_channel.owner_name || reduceDIDstring(this_channel.target_did)}</Typography>
          <Typography variant='body2' color='text.secondary' textAlign='center'>{this_channel.intro}</Typography>
        </Stack>
        <Stack alignItems='center'>
          <Stack direction='row' spacing={1}>
            <Typography variant='subtitle2' sx={{display: 'flex', alignItems: 'center'}}><Icon icon="clarity:group-line" fontSize='20px' />&nbsp;{this_channel['subscribers'].length} Subscribers</Typography>
            <StyledButton size='small'>Subscribed</StyledButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
    <Card>
      <CardHeader 
        title={
          <Typography variant='h5' sx={{ display: 'flex', alignItems: 'center' }}>Subscribers</Typography>
        } 
        subheader={
          <Typography variant='body2' color='text.secondary'>View all Subscribers</Typography>
        }
      />
      <CardContent sx={{pt: 0}}>
        <Grid container spacing={2}>
          {
            this_channel['subscribers'].map((item, index)=>(
              <Grid item xs={12} key={index}>
                <SubscriberListItem subscriber={item}/>
              </Grid>
            ))
          }
          <Grid item xs={12} textAlign='center'>
            <Button color="inherit">
              Show more
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  </>
}
function RightPanel() {
  const { queryStep } = useContext(SidebarContext);
  const [focusedChannel, setFocusChannel] = React.useState(null)
  // const closeSidebar = () => toggleSidebar();
  const theme = useTheme();
  const { pathname } = useLocation();
  const location = useLocation();
  const visitedChannelId = useSelector(selectVisitedChannelId)
  const publicChannels = useSelector(selectPublicChannels)
  const dispNameOfChannels = useSelector(selectDispNameOfChannels)
  const subscribersOfChannel = useSelector(selectSubscribers)
  const channelAvatars = useSelector(selectChannelAvatar)
  const focusedChannelId = useSelector(selectFocusedChannelId)
  let content = null
  const selectedChannelId = visitedChannelId || focusedChannelId

  React.useEffect(()=>{
    if(queryStep && selectedChannelId) {
      LocalDB.get(selectedChannelId.toString())
        .then(doc=>{
          setFocusChannel(doc)
        })
    }
  }, [queryStep, selectedChannelId])

  if(pathname.startsWith('/setting')) {
    if(pathname.endsWith('/credentials'))
      content = 
        <Card>
          <CardHeader title={<Typography variant='h5'>Preview</Typography>}/>
          <CardContent>
            <Stack mb={2}>
              <StyledAvatar alt='Asralf' src='/channel.png' width={80}/>
              <Typography variant='h5' mt={1}>@asralf</Typography>
              <Typography variant='body2'>{reduceHexAddress('0x9A83Fd213843799AB8C7d383Fd213843799AB8C7')}</Typography>
              <Typography variant='body2' color='text.secondary'>Hello! I love Elastos. Subscribe to my channel to get the latest info!</Typography>
            </Stack>
            <Stack alignItems='center'>
              <Stack direction='row' spacing={1}>
                <Typography variant='body2'><Typography variant='subtitle2' display='inline-flex'>5&nbsp;</Typography>Channels</Typography>
                <Typography variant='body2'><Typography variant='subtitle2' display='inline-flex'>100&nbsp;</Typography>Subscribers</Typography>
                <Typography variant='body2'><Typography variant='subtitle2' display='inline-flex'>32&nbsp;</Typography>Subscriptions</Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
  } else if(pathname.startsWith('/explore/channel')) {
    const { channel_id } = (location.state || {}) as any
    const channelOwnerName = dispNameOfChannels[channel_id]
    const channelSubscribers = subscribersOfChannel[channel_id] || []
    const activeChannel = {...publicChannels[channel_id], owner_name: channelOwnerName, subscribers: channelSubscribers}
    content = <ChannelAbout this_channel={activeChannel}/>
  }
  else {
    if(focusedChannel) {
      const channelOwnerName = dispNameOfChannels[selectedChannelId]
      const channelSubscribers = subscribersOfChannel[selectedChannelId] || []
      const channelAvatarSrc = decodeBase64(channelAvatars[selectedChannelId] || "")
      const activeChannel = {...focusedChannel, owner_name: channelOwnerName, subscribers: channelSubscribers, avatarSrc: channelAvatarSrc}
      content = <ChannelAbout this_channel={activeChannel}/>
    }
    else 
      content = 
        <>
          <Card>
            <CardHeader 
              title={
                <Typography variant='h5'>Trends</Typography>
              } 
            />
            <CardContent sx={{pt: 0}}>
              <ListWrapper disablePadding>
                <ListItem
                  button
                >
                  <ListItemText 
                    primary={
                      <Typography variant='subtitle2' color='text.primary'>#web5</Typography>
                    }
                    secondary="100 post"
                  />
                </ListItem>
                <ListItem
                  button
                >
                  <ListItemText 
                    primary={
                      <Typography variant='subtitle2' color='text.primary'>#web5</Typography>
                    }
                    secondary="100 post"
                  />
                </ListItem>
              </ListWrapper>
            </CardContent>
          </Card>
          <Card>
            <CardHeader 
              title={
                <Typography variant='h5' sx={{ display: 'flex', alignItems: 'center' }}>Collection Channels&nbsp;<Icon icon="eva:info-outline"/></Typography>
              } 
              subheader={
                <Typography variant='body2' color='text.secondary'>Powered by Pasar Protocol</Typography>
              }
            />
            <CardContent sx={{pt: 0}}>
              <Grid container spacing={2}>
                {
                  Array(5).fill(null).map((_, index)=>(
                    <Grid item xs={12} key={index}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <StyledAvatar alt='Elastos' src='/static/images/avatars/2.jpg' width={32}/>
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                          <Typography component='div' variant="subtitle2" noWrap>
                            Phantz Club
                          </Typography>
                          <Typography variant="body2" color='text.secondary' noWrap>
                            100 Subscribers
                          </Typography>
                        </Box>
                        <Box>
                          <StyledButton type="outlined" size='small'>Subscribe</StyledButton>
                        </Box>
                      </Stack>
                    </Grid>
                  ))
                }
                <Grid item xs={12} textAlign='center'>
                  <Button color="inherit">
                    Show more
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
  }

  return (
    <>
      <SidebarWrapper
        sx={{
          display: {
            xs: 'none',
            lg: 'inline-block'
          },
          boxShadow:
            theme.palette.mode === 'dark' ? theme.sidebar.boxShadow : 'none'
        }}
      >
        <Scrollbar>
          <Stack spacing={3} my={3} px={2}>
            <InputOutline
              type="text"
              placeholder="Search"
              size="small"
              startAdornment={
                <InputAdornment position="start">
                  <SearchTwoToneIcon />
                </InputAdornment>
              }
            />
            { content }
          </Stack>
        </Scrollbar>
      </SidebarWrapper>
    </>
  );
}

export default RightPanel;
