import React, { useContext } from 'react';
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import ShareIcon from '@mui/icons-material/ShareOutlined';
import { Stack, Box, styled, useTheme, Button, Card, CardHeader, CardContent, InputAdornment, Typography, Grid, IconButton } from '@mui/material';

import Scrollbar from 'components/Scrollbar';
import StyledAvatar from 'components/StyledAvatar'
import StyledButton from 'components/StyledButton'
import InputOutline from 'components/InputOutline'
import PublicChannelSkeleton from 'components/Skeleton/PublicChannelSkeleton';
import SubscribeButton from 'components/SubscribeButton';
import SubscriberListItem from './SubscriberListItem';
import PublicChannelItem from './PublicChannelItem';
import { SidebarContext } from 'contexts/SidebarContext';
import { getLocalDB, QueryStep } from 'utils/db'
import { getDocId } from 'utils/mainproc';
import { selectDispNameOfChannels, selectFocusedChannelId, selectVisitedChannelId, selectSubscribers, selectChannelAvatar } from 'redux/slices/channel';
import { reduceHexAddress, reduceDIDstring, decodeBase64 } from 'utils/common'

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
// const ListWrapper = styled(List)(
//   () => `
//       .MuiListItem-root {
//         border-radius: 0;
//         margin: 0;
//       }
// `
// );
const ChannelAbout = (props) => {
  const { this_channel } = props
  const editable = this_channel['is_self']
  const navigate = useNavigate()

  const link2Edit = ()=>{
    navigate(`/channel/edit/${this_channel['channel_id']}`);
  }
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
              <StyledButton type='outlined' size='small' onClick={link2Edit}>Edit channel</StyledButton>
            }
          </Stack>
        </Stack>
        <Stack alignItems='center' my={2}>
          <StyledAvatar alt={this_channel.display_name} src={this_channel.avatarSrc} width={60}/>
          <Typography variant='h5' mt={1}>{this_channel.display_name}</Typography>
          <Typography variant='body2'>@{this_channel.owner_name || reduceDIDstring(this_channel.target_did)}</Typography>
          <Typography variant='body2' color='text.secondary' textAlign='center'>{this_channel.intro}</Typography>
        </Stack>
        <Stack alignItems='center'>
          <Stack direction='row' spacing={1}>
            <Typography variant='subtitle2' sx={{display: 'flex', alignItems: 'center'}}><Icon icon="clarity:group-line" fontSize='20px' />&nbsp;{this_channel['subscribers'].length} Subscribers</Typography>
            <SubscribeButton channel={this_channel}/>
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
  const { queryStep, queryPublicStep, updateChannelNumber } = useContext(SidebarContext);
  const [focusedChannel, setFocusChannel] = React.useState(null)
  const [isLoadingPublicChannel, setIsLoadingPublicChannels] = React.useState(false)
  const [publicChannels, setPublicChannels] = React.useState([])
  const theme = useTheme();
  const { pathname } = useLocation();
  const visitedChannelId = useSelector(selectVisitedChannelId)
  const dispNameOfChannels = useSelector(selectDispNameOfChannels)
  const subscribersOfChannel = useSelector(selectSubscribers)
  const channelAvatars = useSelector(selectChannelAvatar)
  const focusedChannelId = useSelector(selectFocusedChannelId)
  const LocalDB = getLocalDB()
  let content = null

  React.useEffect(()=>{
    let selectedChannelId = focusedChannelId
    const isSubscribedChannel = pathname.startsWith('/subscription/channel')? true: false
    const isPublicChannel = pathname.startsWith('/explore/channel')? true: false
    if(isSubscribedChannel || isPublicChannel)
      selectedChannelId = visitedChannelId

    if(selectedChannelId && ((queryStep && !isPublicChannel) || (queryPublicStep && isPublicChannel))) {
      LocalDB.get(getDocId(selectedChannelId, isPublicChannel))
        .then(doc=>{
          setFocusChannel(doc)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryStep, queryPublicStep, visitedChannelId, focusedChannelId, pathname])

  React.useEffect(()=>{
    let selectedChannelId = focusedChannelId
    const isSubscribedChannel = pathname.startsWith('/subscription/channel')? true: false
    const isPublicChannel = pathname.startsWith('/explore/channel')? true: false
    if(isSubscribedChannel)
      selectedChannelId = visitedChannelId

    if(selectedChannelId && !isPublicChannel && updateChannelNumber) {
      LocalDB.get(selectedChannelId)
        .then(doc=>{
          setFocusChannel(doc)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateChannelNumber])

  React.useEffect(()=>{
    if(queryPublicStep < QueryStep.public_channel && !publicChannels.length)
      setIsLoadingPublicChannels(true)
    if(queryPublicStep >= QueryStep.public_channel)
      LocalDB.find({
        selector: {
          table_type: 'public-channel'
        },
      })
        .then(response=>{
          setPublicChannels(response.docs)
          setIsLoadingPublicChannels(false)
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryPublicStep])

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
  }
  else {
    const loadingChannelSkeletons = Array(5).fill(null)
    if(focusedChannel) {
      const channelOwnerName = dispNameOfChannels[focusedChannel.channel_id]
      const channelSubscribers = subscribersOfChannel[focusedChannel.channel_id] || []
      const channelAvatarSrc = decodeBase64(channelAvatars[focusedChannel.channel_id] || "")
      const activeChannel = {...focusedChannel, owner_name: channelOwnerName, subscribers: channelSubscribers}
      if(!pathname.startsWith('/explore/channel'))
        activeChannel['avatarSrc'] = channelAvatarSrc
      content = <ChannelAbout this_channel={activeChannel}/>
    }
    else 
      content = 
        <>
          {/* <Card>
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
          </Card> */}
          <Card>
            <CardHeader 
              title={
                <Typography variant='h5' sx={{ display: 'flex', alignItems: 'center' }}>Public Channels&nbsp;<Icon icon="eva:info-outline"/></Typography>
              } 
              subheader={
                <Typography variant='body2' color='text.secondary'>Powered by Pasar Protocol</Typography>
              }
            />
            <CardContent sx={{pt: 0}}>
              <Grid container spacing={2}>
                {
                  isLoadingPublicChannel?
                  loadingChannelSkeletons.map((_, _i)=>(
                    <Grid item xs={12} key={_i}>
                      <PublicChannelSkeleton/>
                    </Grid>
                  )):
                  publicChannels.map((channel, _i)=>(
                    <Grid item xs={12} key={_i}>
                      <PublicChannelItem channel={channel}/>
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
