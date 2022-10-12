import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Box, Typography, Tabs, Tab, Stack, Container, InputAdornment, Grid } from '@mui/material';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';

import { CHANNEL_REG_CONTRACT_ABI } from 'abi/ChannelRegistry';
import { ChannelRegContractAddress } from 'config';
import TabPanel from 'components/TabPanel'
import ChannelCard from 'components/ChannelCard'
import PostTextCard from 'components/PostCard/PostTextCard'
import PostImgCard from 'components/PostCard/PostImgCard'
import InputOutline from 'components/InputOutline'
import { SidebarContext } from 'contexts/SidebarContext';
import { HiveApi } from 'services/HiveApi';
import { selectPublicChannels, selectDispNameOfChannels, setPublicChannels, setDispNameOfChannels } from 'redux/slices/channel';
import { selectPublicPosts, setPublicPosts, updateMediaOfPosts } from 'redux/slices/post';
import { getIpfsUrl, getWeb3Contract, isJson, getMergedArray, sortByDate } from 'utils/common'

function Explore() {
  const { selfChannels } = React.useContext(SidebarContext);
  const [tabValue, setTabValue] = React.useState(0);
  const hiveApi = new HiveApi()
  const dispatch = useDispatch()
  const publicChannels = useSelector(selectPublicChannels)
  const publicPosts = useSelector(selectPublicPosts)
  const latestPublicPosts = sortByDate(getMergedArray(publicPosts)).slice(0, 10)
  React.useEffect(()=>{
    if(publicChannels.length>0)
      return
    const channelRegContract = getWeb3Contract(CHANNEL_REG_CONTRACT_ABI, ChannelRegContractAddress, false)
    channelRegContract.methods.channelIds().call()
      .then(res=>{
        if(Array.isArray(res)) {
          res.forEach(async(tokenId)=>{
            const channelInfo = await channelRegContract.methods.channelInfo(tokenId).call()
            const metaUri = getIpfsUrl(channelInfo['tokenURI'])

            if(channelInfo['channelEntry']) {
              const splitEntry = channelInfo['channelEntry'].split('/')
              if(splitEntry.length>1) {
                const targetDid = splitEntry[splitEntry.length - 2]
                const channelId = splitEntry[splitEntry.length - 1]
                hiveApi.queryPublicPostByChannelId(targetDid, channelId)
                  .then(res=>{
                    if(res['find_message'] && res['find_message']['items']) {
                      const tempGroup = {}
                      const postItems = res['find_message']['items']
                      tempGroup[channelId] = postItems.map(item=>{
                        if(isJson(item.content))
                          item.content = JSON.parse(item.content)
                        return item
                      })
                      tempGroup[channelId].forEach(post=>{
                        if(!post.content.mediaData.length)
                          return
                        post.content.mediaData.forEach((media, _i)=>{
                          if(!media.originMediaPath)
                            return
                          hiveApi.downloadScripting(targetDid, media.originMediaPath)
                            .then(res=>{
                              if(res) {
                                const tempost = {...post, mediaSrc: res}
                                dispatch(updateMediaOfPosts(tempost))
                              }
                            })
                            .catch(err=>{
                              console.log(err)
                            })
                        })
                      })
                      console.log(tempGroup, "---------pp")
                      dispatch(setPublicPosts(tempGroup))
                    }
                  })
                  .catch(err=>{
                  })
                
                hiveApi.queryUserDisplayName(targetDid, channelId, targetDid)
                  .then(res=>{
                    if(res['find_message'] && res['find_message']['items'].length)
                      dispatch(
                        setDispNameOfChannels({
                          channel_id: channelId,
                          data: res['find_message']['items'][0].display_name
                        })
                      )
                  })

                if(metaUri) {
                  fetch(metaUri)
                    .then(response => response.json())
                    .then(data => {
                      const channelData = data
                      if(channelData.data) {
                        channelData.data['avatarSrc'] = getIpfsUrl(channelData.data['avatar'])
                        channelData.data['bannerSrc'] = getIpfsUrl(channelData.data['banner'])
                      }
                      dispatch(
                        setPublicChannels({
                          channel_id: channelId,
                          data: channelData
                        })
                      )
                    })
                    .catch(console.log);
                }
              }
            }
            console.log(channelInfo, "----------oo")
          })
        }
      })
  }, [])

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  console.log(publicPosts, "==========pp")
  return (
    <Container sx={{ mt: 3 }} maxWidth={false}>
      <Stack direction="row" spacing={4}>
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
            <Tab label="All" />
            <Tab label="Channels" />
            <Tab label="Posts" />
            <Tab label="Hashtags" />
            <Tab label="NFTs" />
        </Tabs>
        <InputOutline
          type="text"
          placeholder="Search"
          size="small"
          startAdornment={
            <InputAdornment position="start">
              <SearchTwoToneIcon />
            </InputAdornment>
          }
          style={{flexGrow: 1}}
        />
      </Stack>
      <TabPanel value={tabValue} index={0} nopadding={true}>
        <Grid container sx={{pt: 2}} spacing={2}>
          {
            Object.values(publicChannels).map((channel, _i)=>(
              <Grid item sm={4} md={3} key={_i}>
                <ChannelCard info={channel}/>
              </Grid>
            ))
          }
          {
            latestPublicPosts.map((post, _i)=>{
              if(!!post.content.mediaData && post.content.mediaData.length)
                return (
                  <Grid item xs={12} md={6} key={_i}>
                    <PostImgCard post={post}/>
                  </Grid>
                )
              return (
                <Grid item sm={4} md={3} key={_i}>
                  <PostTextCard post={post}/>
                </Grid>
              )
            })
          }
        </Grid>
        {/* <Grid container sx={{pt: 2}} spacing={2}>
          <Grid item sm={4} md={3}>
            <ChannelCard info={tempchannel}/>
          </Grid>
          <Grid item sm={4} md={3}>
            <ChannelCard info={tempchannel}/>
          </Grid>
          <Grid item sm={4} md={3}>
            <ChannelCard info={tempchannel}/>
          </Grid>
          <Grid item sm={4} md={3}>
            <PostTextCard post={tempost} contentObj={tempostcontent}/>
          </Grid>
          <Grid item sm={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <PostImgCard post={tempost} contentObj={tempostcontent}/>
              </Grid>
              <Grid item sm={12} md={6}>
                <ChannelCard info={tempchannel}/>
              </Grid>
              <Grid item sm={12} md={6}>
                <ChannelCard info={tempchannel}/>
              </Grid>
            </Grid>
          </Grid>
          <Grid item sm={12} md={6}>
            <Grid container spacing={2}>
              <Grid item sm={12} md={6}>
                <ChannelCard info={tempchannel}/>
              </Grid>
              <Grid item sm={12} md={6}>
                <ChannelCard info={tempchannel}/>
              </Grid>
              <Grid item xs={12}>
                <PostImgCard post={tempost} contentObj={tempostcontent}/>
              </Grid>
            </Grid>
          </Grid>
        </Grid> */}
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
      </TabPanel>
      <TabPanel value={tabValue} index={4}>
      </TabPanel>
    </Container>
  );
}

export default Explore;
