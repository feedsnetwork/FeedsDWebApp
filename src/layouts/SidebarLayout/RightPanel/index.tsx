import React from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux'
import { Icon } from '@iconify/react';
// import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import { useSnackbar } from 'notistack';
import ShareIcon from '@mui/icons-material/ShareOutlined';
import { Stack, Box, styled, useTheme, Button, Card, CardHeader, CardContent, Typography, Grid, IconButton, Tooltip } from '@mui/material';

import Scrollbar from 'components/Scrollbar';
import StyledAvatar from 'components/StyledAvatar'
import StyledButton from 'components/StyledButton'
// import InputOutline from 'components/InputOutline'
import ChannelName from 'components/ChannelName';
import PublicChannelSkeleton from 'components/Skeleton/PublicChannelSkeleton';
import SubscribeButton from 'components/SubscribeButton';
import NoRingAvatar from 'components/NoRingAvatar';
import SubscriberListItem from './SubscriberListItem';
import PublicChannelItem from './PublicChannelItem';
import { SidebarContext } from 'contexts/SidebarContext';
import { selectFocusedChannelId, selectVisitedChannelId, selectChannelById, selectSelfChannelsCount, selectSubscribedChannelsCount } from 'redux/slices/channel';
import { selectMyInfo } from 'redux/slices/user';
import { selectQueryPublicStep } from 'redux/slices/proc';
import { reduceHexAddress, reduceDIDstring, getImageSource, getChannelShortUrl, copy2clipboard } from 'utils/common'
import { getLocalDB } from 'utils/db'

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
  const subscribers = this_channel['subscribers'] || []
  const totalPageOfSubscription = Math.ceil((subscribers.length || 0)/10) || 1
  const [currentPageOfSubscription, setCurrentPageOfSubscription] = React.useState(1);
  const editable = this_channel['is_self']
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate()

  React.useEffect(()=>{
    setCurrentPageOfSubscription(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [this_channel['channel_id']])

  const link2Edit = ()=>{
    navigate(`/channel/edit/${this_channel['channel_id']}`);
  }
  const handleShowMore = () => {
    setCurrentPageOfSubscription(currentPageOfSubscription+1)
  }
  const handleShareChannel = () => {
    getChannelShortUrl(this_channel)
      .then(shortUrl=>{
        copy2clipboard(shortUrl)
          .then(_=>{
            enqueueSnackbar('Copied to clipboard', { variant: 'success' });
          })
      })
  }
  return <>
    <Card>
      <CardContent>
        <Stack alignItems='end'>
          <Stack direction='row' spacing={1}>
            <Box m='auto'>
              <IconButton sx={{borderRadius: '50%', backgroundColor: (theme)=>theme.colors.primary.main}} size='small' onClick={handleShareChannel}><ShareIcon fontSize='small'/></IconButton>
            </Box>
            {
              editable &&
              <StyledButton type='outlined' size='small' onClick={link2Edit}>Edit channel</StyledButton>
            }
          </Stack>
        </Stack>
        <Stack alignItems='center' my={2}>
          <NoRingAvatar alt={this_channel.display_name} src={this_channel.avatarSrc} width={60}/>
          <ChannelName name={this_channel.display_name} isPublic={this_channel['is_public']} variant="h5" sx={{mt: 1}}/>
          <Typography variant='body2'>@{this_channel.owner_name || reduceDIDstring(this_channel.target_did)}</Typography>
          <Typography variant='body2' color='text.secondary' textAlign='center'>{this_channel.intro}</Typography>
        </Stack>
        <Stack alignItems='center'>
          <Stack direction='row' spacing={1}>
            <Typography variant='subtitle2' sx={{display: 'flex', alignItems: 'center'}}><Icon icon="clarity:group-line" fontSize='20px' />&nbsp;{subscribers.length} Subscribers</Typography>
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
            subscribers.slice(0, 10*currentPageOfSubscription).map((item, index)=>(
              <Grid item xs={12} key={index}>
                <SubscriberListItem subscriber={item}/>
              </Grid>
            ))
          }
          {
            currentPageOfSubscription < totalPageOfSubscription &&
            <Grid item xs={12} textAlign='center'>
              <Button color="inherit" onClick={handleShowMore}>
                Show more
              </Button>
            </Grid>
          }
        </Grid>
      </CardContent>
    </Card>
  </>
}
const ProfilePreview = () => {
  const { walletAddress } = React.useContext(SidebarContext);
  const myInfo = useSelector(selectMyInfo)
  const selfChannelCount = useSelector(selectSelfChannelsCount)
  const subscribedChannelCount = useSelector(selectSubscribedChannelsCount)
  const myAvatarUrl = myInfo['avatar_url']
  const [avatarSrc, setAvatarSrc] = React.useState('');
  const LocalDB = getLocalDB()

  React.useEffect(()=>{
    if(myAvatarUrl) {
      LocalDB.get(myAvatarUrl)
        .then(doc=>getImageSource(doc['source']))
        .then(setAvatarSrc)
    }
    else
        setAvatarSrc('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myAvatarUrl])

  return (
    <Card>
      <CardHeader title={<Typography variant='h5'>Preview</Typography>}/>
      <CardContent>
        <Stack mb={2}>
          <StyledAvatar alt={myInfo['name']} src={avatarSrc} width={80}/>
          <Typography variant='h5' mt={1}>@{myInfo['name']}</Typography>
          <Typography variant='body2'>{reduceHexAddress(walletAddress)}</Typography>
          <Typography variant='body2' color='text.secondary'>{myInfo['description']}</Typography>
        </Stack>
        <Stack alignItems='center'>
          <Stack direction='row' spacing={1}>
            <Typography variant='body2'><Typography variant='subtitle2' display='inline-flex'>{selfChannelCount}&nbsp;</Typography>Channels</Typography>
            {/* <Typography variant='body2'><Typography variant='subtitle2' display='inline-flex'>100&nbsp;</Typography>Subscribers</Typography> */}
            <Typography variant='body2'><Typography variant='subtitle2' display='inline-flex'>{subscribedChannelCount}&nbsp;</Typography>Subscriptions</Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
function RightPanel() {
  const [isLoadingPublicChannel, setIsLoadingPublicChannels] = React.useState(true)
  const [publicChannels, setPublicChannels] = React.useState([])
  const theme = useTheme();
  const { pathname } = useLocation();
  const visitedChannelId = useSelector(selectVisitedChannelId)
  const focusedChannelId = useSelector(selectFocusedChannelId)
  const currentPublicChannelStep = useSelector(selectQueryPublicStep('public_channel'))

  const isSubscribedChannel = pathname.startsWith('/subscription/channel')? true: false
  const isPublicChannel = pathname.startsWith('/explore/channel')? true: false
  const selectedChannelId = !isSubscribedChannel && !isPublicChannel? focusedChannelId: visitedChannelId
  const focusedChannel = useSelector(selectChannelById(selectedChannelId)) || {}

  const LocalDB = getLocalDB()
  let content = null

  React.useEffect(()=>{
    if(currentPublicChannelStep)
      LocalDB.find({
        selector: {
          table_type: 'channel',
          is_public: true
        },
        limit: 5
      })
        .then(response=>{
          setPublicChannels(response.docs)
          setIsLoadingPublicChannels(false)
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPublicChannelStep])

  if(pathname.startsWith('/setting')) {
    if(pathname.endsWith('/credentials'))
      content = <ProfilePreview />
  }
  else if(pathname.startsWith('/post')) {
    content = null
  }
  else {
    const loadingChannelSkeletons = Array(5).fill(null)
    if(focusedChannel) {
      switch(pathname.replaceAll('/','')) {
        case "home":
        case "profile":
        case "profileothers":
          break;
        default:
          const activeChannel = {...focusedChannel}
          activeChannel['avatarSrc'] = getImageSource(activeChannel['avatarSrc'])
          content = <ChannelAbout this_channel={activeChannel}/>
          break;
      }
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
                <Typography variant='h5' sx={{ display: 'flex', alignItems: 'center' }}>
                  Public Channels&nbsp;
                  <Tooltip arrow title="Public channels are shared to subscribe.">
                    <Icon icon="eva:info-outline"/>
                  </Tooltip>
                </Typography>
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
                {
                  publicChannels.length>4 &&
                  <Grid item xs={12} textAlign='center'>
                    <Button 
                      to='/explore'
                      state={{ tab: 1 }} 
                      component={RouterLink}
                      color="inherit"
                    >
                      Show more
                    </Button>
                  </Grid>
                }
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
          <Stack spacing={3} my={3} px={2} mt={8}>
            {/* <InputOutline
              type="text"
              placeholder="Search"
              size="small"
              startAdornment={
                <InputAdornment position="start">
                  <SearchTwoToneIcon />
                </InputAdornment>
              }
            /> */}
            { content }
          </Stack>
        </Scrollbar>
      </SidebarWrapper>
    </>
  );
}

export default RightPanel;
