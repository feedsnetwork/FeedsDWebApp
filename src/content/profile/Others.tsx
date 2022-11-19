import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Container, Box, Typography, Stack, IconButton, Tabs, Tab } from '@mui/material';
import ShareIcon from '@mui/icons-material/ShareOutlined';

import StyledAvatar from 'components/StyledAvatar'
import { EmptyViewInProfile } from 'components/EmptyView'
import PostCard from 'components/PostCard';
import TabPanel from 'components/TabPanel'
import ChannelListItem from './ChannelListItem'
import { SidebarContext } from 'contexts/SidebarContext';
// import { HiveApi } from 'services/HiveApi'
import { reduceHexAddress, reduceDIDstring, getFilteredArrayByUnique, getMergedArray } from 'utils/common'

function OthersProfile() {
  const { walletAddress, postsInSelf, postsInSubs, selfChannels, subscribedChannels, subscriberInfo } = React.useContext(SidebarContext);
  const [tabValue, setTabValue] = React.useState(0);
  const [subscriptions, setSubscriptions] = React.useState([]);
  const location = useLocation();
  const { user_did } = (location.state || {}) as any
  const this_user = subscriberInfo[user_did] || {}
  const userInfo = this_user['info'] || {}
  const avatarSrc = this_user['avatar']
  const likedPosts = getFilteredArrayByUnique(
    [...getMergedArray(postsInSelf), ...getMergedArray(postsInSubs)]
      .filter(item=>item.like_creators && item.like_creators.includes(user_did)), 'post_id')
  // const feedsDid = sessionStorage.getItem('FEEDS_DID')
  // const userDid = `did:elastos:${feedsDid}`
  // const hiveApi = new HiveApi()

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  React.useEffect(()=>{
    setSubscriptions([])
    // if(!feedsDid)
    //   return
      
    // hiveApi.querySubscriptionInfoByUserDID(userDid, userDid)
    //   .then(res=>{
    //     if(res['find_message'])
    //       setSubscriptions(res['find_message']['items'])
    //   })
  }, [])

  // const backgroundImg = "/temp-back.png"
  return (
    <Container sx={{ mt: 3 }} maxWidth="lg">
      <Card>
        <Box sx={{position: 'relative'}}>
          {/* <Box sx={{ height: {xs: 120, md: 200}, background: `url(${backgroundImg}) no-repeat center`, backgroundSize: 'cover'}}/> */}
          <Box sx={{ height: {xs: 120, md: 200}, background: 'linear-gradient(180deg, #000000 0%, #A067FF 300.51%)', backgroundSize: 'cover'}}/>
          <StyledAvatar alt={userInfo['name']} src={avatarSrc} width={90} style={{position: 'absolute', bottom: -45, left: 45}}/>
        </Box>
        <Box px={2} py={1}>
          <Stack direction='row' spacing={1}>
            <Box ml='auto'>
              <IconButton sx={{borderRadius: '50%', backgroundColor: (theme)=>theme.colors.primary.main}} size='small'><ShareIcon fontSize='small'/></IconButton>
            </Box>
          </Stack>
          <Stack spacing={1} px={{sm: 0, md: 3}} mt={2}>
            <Typography variant="h3">@{userInfo['name'] || reduceDIDstring(user_did)}</Typography>
            {/* <Typography variant="body1">{reduceHexAddress(walletAddress)}</Typography> */}
            <Typography variant="body1">{userInfo['description']}</Typography>
            <Stack direction="row" sx={{flexWrap: 'wrap'}}>
              <Typography variant="body1" pr={3}><strong>{selfChannels.length}</strong> Channel</Typography>
              <Typography variant="body1"><strong>{subscriptions.length}</strong> Subscriptions</Typography>
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
            !selfChannels.length?
            <EmptyViewInProfile type='channel'/>:

            <Stack spacing={1}>
              {
                selfChannels.map((channel, _i)=>(
                  <ChannelListItem channel={channel} key={_i}/>
                ))
              }
            </Stack>
          }
        </TabPanel>
        {/* <TabPanel value={tabValue} index={1}>
          <EmptyViewInProfile type='collectible'/>
        </TabPanel> */}
        <TabPanel value={tabValue} index={1}>
          {
            !likedPosts.length?
            <EmptyViewInProfile type='like'/>:

            <Stack spacing={2}>
              {
                likedPosts.map((post, _i)=>{
                  const channelOfPost = [...selfChannels, ...subscribedChannels].find(item => item.channel_id === post.channel_id) || {}
                  let dispName = ''
                  if(channelOfPost.target_did === user_did) {
                    dispName = userInfo['name'] || reduceDIDstring(user_did)
                  } else {
                    dispName = channelOfPost['owner_name'] || reduceDIDstring(channelOfPost.target_did)
                  }
                  return <PostCard post={post} dispName={dispName} key={_i} direction='row'/>
                })
              }
            </Stack>
          }
        </TabPanel>
      </Card>
    </Container>
  );
}

export default OthersProfile;
