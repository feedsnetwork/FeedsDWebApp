import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Container, Box, Typography, Stack, Tabs, Tab } from '@mui/material';
// import ShareIcon from '@mui/icons-material/ShareOutlined';

import StyledButton from 'components/StyledButton'
import StyledAvatar from 'components/StyledAvatar'
import { EmptyViewInProfile } from 'components/EmptyView'
import PostCard from 'components/PostCard';
import TabPanel from 'components/TabPanel'
import ChannelListItem from './ChannelListItem'
import ChannelSkeleton from 'components/Skeleton/ChannelSkeleton';
import PostSkeleton from 'components/Skeleton/PostSkeleton';
import { reduceDIDstring, decodeBase64, getImageSource } from 'utils/common'
import { getLocalDB } from 'utils/db';
import { selectMyInfo } from 'redux/slices/user';
import { selectSelfChannels, selectSubscribedChannels } from 'redux/slices/channel';
import { selectQueryStepStatus } from 'redux/slices/proc';

function Profile() {
  const currentLikeStep = useSelector(selectQueryStepStatus('post_like'))
  const [avatarSrc, setAvatarSrc] = React.useState('');
  const [tabValue, setTabValue] = React.useState(0);
  const [likedPosts, setLikedPosts] = React.useState([])
  const [isLoadingLike, setIsLoadingLike] = React.useState(true)
  const feedsDid = localStorage.getItem('FEEDS_DID')
  const myInfo = useSelector(selectMyInfo)
  const myAvatarUrl = myInfo['avatar_url']
  const selfChannels = Object.values(useSelector(selectSelfChannels))
  const subscribedChannels = Object.values(useSelector(selectSubscribedChannels))
  const isSelfChannelLoaded = useSelector(selectQueryStepStatus('self_channel'))
  const LocalDB = getLocalDB()

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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

  React.useEffect(()=>{
    if(currentLikeStep) {
      LocalDB.find({
        selector: {
          table_type: 'post',
          like_me: true
        }
      })
        .then(response => {
          setLikedPosts(response.docs)
          setIsLoadingLike(false)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLikeStep])

  // const backgroundImg = "/temp-back.png"
  const subscriptionCount = selfChannels.filter(channel=>channel['is_subscribed']).length + subscribedChannels.length
  const loadingSkeletons = Array(5).fill(null)
  return (
    <Container sx={{ mt: 3 }} maxWidth="lg">
      <Card>
        <Box sx={{position: 'relative'}}>
          {/* <Box sx={{ height: {xs: 120, md: 200}, background: `url(${backgroundImg}) no-repeat center`, backgroundSize: 'cover'}}/> */}
          <Box sx={{ height: {xs: 120, md: 200}, background: 'linear-gradient(180deg, #000000 0%, #A067FF 300.51%)', backgroundSize: 'cover'}}/>
          <StyledAvatar alt={myInfo['name']} src={avatarSrc} width={90} style={{position: 'absolute', bottom: -45, left: 45}}/>
        </Box>
        <Box px={2} py={1}>
          <Stack direction='row' spacing={1}>
            {/* <Box ml='auto'>
              <IconButton sx={{borderRadius: '50%', backgroundColor: (theme)=>theme.colors.primary.main}} size='small'><ShareIcon fontSize='small'/></IconButton>
            </Box> */}
            <Box ml='auto'>
              <StyledButton type='outlined' size='small'>Edit Profile</StyledButton>
            </Box>
          </Stack>
          <Stack spacing={1} px={{sm: 0, md: 3}} mt={2}>
            <Typography variant="h3">@{myInfo['name'] || reduceDIDstring(feedsDid)}</Typography>
            {/* <Typography variant="body1">{reduceHexAddress(walletAddress)}</Typography> */}
            <Typography variant="body1">{myInfo['description']}</Typography>
            <Stack direction="row" sx={{flexWrap: 'wrap'}}>
              <Typography variant="body1" pr={3}><strong>{selfChannels.length}</strong> Channel</Typography>
              <Typography variant="body1"><strong>{subscriptionCount}</strong> Subscriptions</Typography>
            </Stack>
            {/* <Stack direction='row' spacing={1}>
              <Box component="img" src='/pasar-logo.svg' width={30}/>
            </Stack> */}
          </Stack>
        </Box>
        <Tabs
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          value={tabValue}
          onChange={handleChangeTab}
          aria-label="basic tabs example"
          sx={{
            textAlign: 'center', display: 'block'
          }}
        >
          <Tab label="Channels" />
          {/* <Tab label="Collectibles" /> */}
          <Tab label="Likes" />
        </Tabs>
        <TabPanel value={tabValue} index={0}>
          {
            !selfChannels.length && isSelfChannelLoaded?
            <EmptyViewInProfile type='channel'/>:

            <Stack spacing={1}>
              {
                !isSelfChannelLoaded?
                loadingSkeletons.map((_, _i)=><ChannelSkeleton key={_i}/>):
                selfChannels.map((channel, _i)=><ChannelListItem channel={channel} key={channel['channel_id']}/>)
              }
            </Stack>
          }
        </TabPanel>
        {/* <TabPanel value={tabValue} index={1}>
          <EmptyViewInProfile type='collectible'/>
        </TabPanel> */}
        <TabPanel value={tabValue} index={1}>
          {
            !likedPosts.length && !isLoadingLike?
            <EmptyViewInProfile type='like'/>:

            <Stack spacing={2}>
              {
                isLoadingLike?
                loadingSkeletons.map((_, _i)=><PostSkeleton key={_i}/>):
                likedPosts.map((post, _i)=><PostCard post={post} key={_i} direction='row'/>)
              }
            </Stack>
          }
        </TabPanel>
      </Card>
    </Container>
  );
}

export default Profile;
