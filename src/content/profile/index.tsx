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
import { SidebarContext } from 'contexts/SidebarContext';
import { reduceDIDstring, decodeBase64 } from 'utils/common'
import { getLocalDB, QueryStep } from 'utils/db';
import { selectMyInfo } from 'redux/slices/user';
import { selectSelfChannels, selectSubscribedChannels } from 'redux/slices/channel';

function Profile() {
  const { queryStep } = React.useContext(SidebarContext);
  const [tabValue, setTabValue] = React.useState(0);
  const [likedPosts, setLikedPosts] = React.useState([])
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const myInfo = useSelector(selectMyInfo)
  const selfChannels = Object.values(useSelector(selectSelfChannels))
  const subscribedChannels = Object.values(useSelector(selectSubscribedChannels))
  const LocalDB = getLocalDB()

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  React.useEffect(()=>{
    if(queryStep >= QueryStep.post_like) {
      LocalDB.find({
        selector: {
          table_type: 'post',
          like_me: true
        }
      })
        .then(response => {
          setLikedPosts(response.docs)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryStep])

  // const backgroundImg = "/temp-back.png"
  const subscriptionCount = selfChannels.filter(channel=>channel['is_subscribed']).length + subscribedChannels.length
  return (
    <Container sx={{ mt: 3 }} maxWidth="lg">
      <Card>
        <Box sx={{position: 'relative'}}>
          {/* <Box sx={{ height: {xs: 120, md: 200}, background: `url(${backgroundImg}) no-repeat center`, backgroundSize: 'cover'}}/> */}
          <Box sx={{ height: {xs: 120, md: 200}, background: 'linear-gradient(180deg, #000000 0%, #A067FF 300.51%)', backgroundSize: 'cover'}}/>
          <StyledAvatar alt={myInfo['name']} src={decodeBase64(myInfo['avatarSrc'])} width={90} style={{position: 'absolute', bottom: -45, left: 45}}/>
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
            !selfChannels.length?
            <EmptyViewInProfile type='channel'/>:

            <Stack spacing={1}>
              {
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
            !likedPosts.length?
            <EmptyViewInProfile type='like'/>:

            <Stack spacing={2}>
              {
                likedPosts.map((post, _i)=>{
                  const channelOfPost = [...selfChannels, ...subscribedChannels].find(item=>item['channel_id'] === post.channel_id) || {}
                  return <PostCard post={post} channel={channelOfPost} key={_i} direction='row'/>
                })
              }
            </Stack>
          }
        </TabPanel>
      </Card>
    </Container>
  );
}

export default Profile;
