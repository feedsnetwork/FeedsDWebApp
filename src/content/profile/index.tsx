import React from 'react';
import { Card, Container, Box, Typography, Stack, IconButton, Tabs, Tab, Hidden } from '@mui/material';
import ShareIcon from '@mui/icons-material/ShareOutlined';

import StyledButton from 'src/components/StyledButton'
import StyledAvatar from 'src/components/StyledAvatar'
import { EmptyViewInProfile } from 'src/components/EmptyView'
import { OverPageContext } from 'src/contexts/OverPageContext';
import { SidebarContext } from 'src/contexts/SidebarContext';
import { HiveApi } from 'src/services/HiveApi'
import { reduceHexAddress, reduceDIDstring, getInfoFromDID } from 'src/utils/common'

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function Profile() {
  const { setPageType } = React.useContext(OverPageContext)
  const { walletAddress, selfChannels } = React.useContext(SidebarContext);
  const [tabValue, setTabValue] = React.useState(0);
  const [subscriptions, setSubscriptions] = React.useState([]);
  const [userInfo, setUserInfo] = React.useState({})
  const [avatarSrc, setAvatarSrc] = React.useState('')
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const userDid = `did:elastos:${feedsDid}`
  const hiveApi = new HiveApi()

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  React.useEffect(()=>{
    setPageType('Profile')
    if(!feedsDid)
      return
      
    hiveApi.getHiveUrl(userDid)
      .then(async hiveUrl=>{
        const res =  await hiveApi.downloadFileByHiveUrl(userDid, hiveUrl)
        if(res && res.length) {
          const base64Content = res.toString('base64')
          setAvatarSrc(`data:image/png;base64,${base64Content}`)
        }
      })

    hiveApi.querySubscriptionInfoByUserDID(userDid, userDid)
      .then(res=>{
        console.log(res)
        if(res['find_message'])
          setSubscriptions(res['find_message']['items'])
      })
    getInfoFromDID(userDid).then(res=>{
      setUserInfo(res)
    })
  }, [])

  const backgroundImg = "/temp-back.png"
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
              <Typography variant="body1" pr={3}><strong>100</strong> Subscribers</Typography>
              <Typography variant="body1"><strong>{subscriptions.length}</strong> Subscriptions</Typography>
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

            selfChannels.map((channel, _i)=>(
              <Card key={_i} sx={{background: (theme)=>theme.palette.primary.main, p: 2}}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <StyledAvatar alt={channel.name} src={channel.avatarSrc}/>
                  <Box flex={1}>
                    <Hidden mdDown>
                      <Typography variant="body2">{channel.intro}</Typography>
                      <Stack direction="row" sx={{flexWrap: 'wrap', mt: 1}}>
                        <Typography variant="body2" pr={3}><strong>100</strong> Subscribers</Typography>
                        <Typography variant="body2"><strong>32</strong> Subscriptions</Typography>
                      </Stack>
                    </Hidden>
                  </Box>
                  <StyledButton type="outlined" size="small" sx={{height: 'fit-content'}}>Edit Channel</StyledButton>
                </Stack>
                <Hidden mdUp>
                  <Box mt={1}>
                    <Typography variant="body2">{channel.intro}</Typography>
                    <Stack direction="row" sx={{flexWrap: 'wrap', mt: 1}}>
                      <Typography variant="body2" pr={3}><strong>100</strong> Subscribers</Typography>
                      <Typography variant="body2"><strong>32</strong> Subscriptions</Typography>
                    </Stack>
                  </Box>
                </Hidden>
              </Card>
            ))
          }
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <EmptyViewInProfile type='collectible'/>
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <EmptyViewInProfile type='like'/>
        </TabPanel>
      </Card>
    </Container>
  );
}

export default Profile;
