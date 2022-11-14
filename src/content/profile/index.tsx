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
import { reduceHexAddress, reduceDIDstring, decodeBase64 } from 'utils/common'
import { getLocalDB, QueryStep } from 'utils/db';
import { selectMyInfo } from 'redux/slices/user';
import { selectDispNameOfChannels } from 'redux/slices/channel';

function Profile() {
  const { walletAddress, queryStep, queryPublicStep, updateChannelNumber } = React.useContext(SidebarContext);
  const [tabValue, setTabValue] = React.useState(0);
  const [channels, setChannels] = React.useState([])
  const [publicChannels, setPublicChannels] = React.useState([])
  const [likedPosts, setLikedPosts] = React.useState([])
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const myInfo = useSelector(selectMyInfo)
  const dispNameOfChannels = useSelector(selectDispNameOfChannels)
  const LocalDB = getLocalDB()
  const channelTokens = publicChannels.reduce((tokens, channel)=>{
    tokens[channel.channel_id] = channel.tokenId
    return tokens
  }, {})

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  React.useEffect(()=>{
    if(queryStep) {
      LocalDB.find({
        selector: {
          table_type: 'channel'
        }
      })
        .then(response => {
          setChannels(response.docs)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryStep, updateChannelNumber])

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

  React.useEffect(()=>{
    if(queryPublicStep) {
      LocalDB.find({
        selector: {
          table_type: 'public-channel'
        }
      })
        .then(response => {
          setPublicChannels(response.docs)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryPublicStep, updateChannelNumber])

  // const backgroundImg = "/temp-back.png"
  const selfChannels = channels.filter(channel=>channel['is_self'] === true)
  const subscribedChannels = channels.filter(channel=>channel['is_subscribed'] === true)
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
            <Typography variant="body1">{reduceHexAddress(walletAddress)}</Typography>
            <Typography variant="body1">{myInfo['description']}</Typography>
            <Stack direction="row" sx={{flexWrap: 'wrap'}}>
              <Typography variant="body1" pr={3}><strong>{selfChannels.length}</strong> Channel</Typography>
              <Typography variant="body1"><strong>{subscribedChannels.length}</strong> Subscriptions</Typography>
            </Stack>
            <Stack direction='row' spacing={1}>
              <Box component="img" src='/pasar-logo.svg' width={30}/>
            </Stack>
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
          <Tab label="Collectibles" />
          <Tab label="Likes" />
        </Tabs>
        <TabPanel value={tabValue} index={0}>
          {
            !selfChannels.length?
            <EmptyViewInProfile type='channel'/>:

            <Stack spacing={1}>
              {
                selfChannels.map((channel, _i)=><ChannelListItem channel={channel} publishTokenId={channelTokens[channel.channel_id]} key={channel.channel_id}/>)
              }
            </Stack>
          }
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <EmptyViewInProfile type='collectible'/>
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          {
            !likedPosts.length?
            <EmptyViewInProfile type='like'/>:

            <Stack spacing={2}>
              {
                likedPosts.map((post, _i)=>{
                  const channelOfPost = channels.find(item=>item.channel_id === post.channel_id) || {}
                  let dispName = dispNameOfChannels[post.channel_id] || reduceDIDstring(channelOfPost.target_did)
                  return <PostCard post={post} channel={channelOfPost} dispName={dispName} key={_i} direction='row'/>
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
