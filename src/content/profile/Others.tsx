import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card, Container, Box, Typography, Stack, Tabs, Tab } from '@mui/material';
// import ShareIcon from '@mui/icons-material/ShareOutlined';

import StyledAvatar from 'components/StyledAvatar'
import { EmptyViewInProfile } from 'components/EmptyView'
import PostCard from 'components/PostCard';
import TabPanel from 'components/TabPanel'
import ChannelListItem from './ChannelListItem'
import { reduceDIDstring, decodeBase64 } from 'utils/common'
import { selectUserInfoByDID } from 'redux/slices/user';
import { getLocalDB } from 'utils/db';
import { selectQueryStep, selectQueryStepStatus } from 'redux/slices/proc';

function OthersProfile() {
  const isPassedChannelStep = useSelector(selectQueryStepStatus('subscribed_channel'))
  const currentLikeStep = useSelector(selectQueryStep('post_like'))
  const [tabValue, setTabValue] = React.useState(0);
  const [channels, setChannels] = React.useState([])
  const [likedPosts, setLikedPosts] = React.useState([])
  const location = useLocation();
  const { user_did } = (location.state || {}) as any
  const this_user = useSelector(selectUserInfoByDID(user_did)) || {}
  const avatarSrc = decodeBase64(this_user['avatarSrc'] || "")
  const LocalDB = getLocalDB()

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  React.useEffect(()=>{
    if(isPassedChannelStep) {
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
  }, [isPassedChannelStep])

  React.useEffect(()=>{
    if(currentLikeStep) {
      LocalDB.find({
        selector: {
          table_type: 'post',
          like_creators: {'$elemMatch': {'$eq': user_did}}
        }
      })
        .then(response => {
          setLikedPosts(response.docs)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLikeStep])

  // const backgroundImg = "/temp-back.png"
  const selfChannels = channels.filter(channel=>channel['target_did'] === user_did)
  const subscribedChannels = channels.filter(channel=>(channel['subscribers'] && channel['subscribers'].some(subscriber=>subscriber['user_did']===user_did)))
  return (
    <Container sx={{ mt: 3 }} maxWidth="lg">
      <Card>
        <Box sx={{position: 'relative'}}>
          {/* <Box sx={{ height: {xs: 120, md: 200}, background: `url(${backgroundImg}) no-repeat center`, backgroundSize: 'cover'}}/> */}
          <Box sx={{ height: {xs: 120, md: 200}, background: 'linear-gradient(180deg, #000000 0%, #A067FF 300.51%)', backgroundSize: 'cover'}}/>
          <StyledAvatar alt={this_user['name']} src={avatarSrc} width={90} style={{position: 'absolute', bottom: -45, left: 45}}/>
        </Box>
        <Box px={2} py={1}>
          <Stack direction='row' spacing={1} mt={4}>
            {/* <Box ml='auto'>
              <IconButton sx={{borderRadius: '50%', backgroundColor: (theme)=>theme.colors.primary.main}} size='small'><ShareIcon fontSize='small'/></IconButton>
            </Box> */}
          </Stack>
          <Stack spacing={1} px={{sm: 0, md: 3}} mt={2}>
            <Typography variant="h3">@{this_user['name'] || reduceDIDstring(user_did)}</Typography>
            <Typography variant="body1">{this_user['description']}</Typography>
            <Stack direction="row" sx={{flexWrap: 'wrap'}}>
              <Typography variant="body1" pr={3}><strong>{selfChannels.length}</strong> Channel</Typography>
              <Typography variant="body1"><strong>{subscribedChannels.length}</strong> Subscriptions</Typography>
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
                likedPosts.map((post, _i)=><PostCard post={post} key={_i} direction='row'/>)
              }
            </Stack>
          }
        </TabPanel>
      </Card>
    </Container>
  );
}

export default OthersProfile;
