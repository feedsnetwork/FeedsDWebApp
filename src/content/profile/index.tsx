import React from 'react';
import { Card, Container, Box, Typography, Stack, IconButton, Tabs, Tab } from '@mui/material';
import ShareIcon from '@mui/icons-material/ShareOutlined';

import StyledButton from 'components/StyledButton'
import StyledAvatar from 'components/StyledAvatar'
import { EmptyViewInProfile } from 'components/EmptyView'
import PostCard from 'components/PostCard';
import TabPanel from 'components/TabPanel'
import ChannelListItem from './ChannelListItem'
import { SidebarContext } from 'contexts/SidebarContext';
import { HiveApi } from 'services/HiveApi'
import { reduceHexAddress, reduceDIDstring } from 'utils/common'
import { LocalDB, QueryStep } from 'utils/db';

function Profile() {
  const { walletAddress, queryStep, userInfo } = React.useContext(SidebarContext);
  const [tabValue, setTabValue] = React.useState(0);
  const [avatarSrc, setAvatarSrc] = React.useState('')
  const [channels, setChannels] = React.useState([])
  const [likedPosts, setLikedPosts] = React.useState([])
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const myDID = `did:elastos:${feedsDid}`
  const hiveApi = new HiveApi()

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
  }, [queryStep])

  React.useEffect(()=>{
    if(!feedsDid)
      return
      
    hiveApi.getHiveUrl(myDID)
      .then(hiveUrl=>hiveApi.downloadFileByHiveUrl(myDID, hiveUrl))
      .then(res=>{
        const resBuf = res as Buffer
        if(resBuf && resBuf.length) {
          const base64Content = resBuf.toString('base64')
          setAvatarSrc(`data:image/png;base64,${base64Content}`)
        }
      })
      .catch(err=>{})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // const backgroundImg = "/temp-back.png"
  const selfChannels = channels.filter(channel=>channel['is_self'] === true)
  const subscribedChannels = channels.filter(channel=>channel['is_subscribed'] === true)
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
            <StyledButton type='outlined' size='small'>Edit Profile</StyledButton>
          </Stack>
          <Stack spacing={1} px={{sm: 0, md: 3}} mt={2}>
            <Typography variant="h3">@{userInfo['name'] || reduceDIDstring(feedsDid)}</Typography>
            <Typography variant="body1">{reduceHexAddress(walletAddress)}</Typography>
            <Typography variant="body1">{userInfo['description']}</Typography>
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
                selfChannels.map((channel, _i)=>(
                  <ChannelListItem channel={channel} key={_i}/>
                ))
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
                  let dispName = channelOfPost['owner_name'] || reduceDIDstring(channelOfPost.target_did)
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
