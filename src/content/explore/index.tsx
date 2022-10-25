import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import InfiniteScroll from "react-infinite-scroll-component";
import { Box, Tabs, Tab, Stack, Container, InputAdornment } from '@mui/material';
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import AutoResponsive from 'autoresponsive-react'

import { CHANNEL_REG_CONTRACT_ABI } from 'abi/ChannelRegistry';
import { ChannelRegContractAddress } from 'config';
import ChannelCard from 'components/ChannelCard'
import PostTextCard from 'components/PostCard/PostTextCard'
import PostImgCard from 'components/PostCard/PostImgCard'
import InputOutline from 'components/InputOutline'
import { HiveApi } from 'services/HiveApi';
import { selectPublicChannels, setPublicChannels, setDispNameOfChannels } from 'redux/slices/channel';
import { selectPublicPosts, setPublicPosts, updateMediaOfPosts } from 'redux/slices/post';
import { getIpfsUrl, getWeb3Contract, isJson, getMergedArray, sortByDate } from 'utils/common'

function Explore() {
  const [tabValue, setTabValue] = React.useState(0);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [startChannelIndex, setStartChannelIndex] = React.useState(0);
  const [isLastPage, setIsLastPage] = React.useState(false);
  const hiveApi = new HiveApi()
  const dispatch = useDispatch()
  const publicChannels = useSelector(selectPublicChannels)
  const publicPosts = useSelector(selectPublicPosts)
  const latestPublicPosts = sortByDate(getMergedArray(publicPosts)).slice(0, 10)
  const containerRef = React.useRef(null)
  const theme = useTheme();
  const greaterThanMid = useMediaQuery(theme.breakpoints.up("md"));
  const smallToMid = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const lessThanSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const cardWidthRate = (greaterThanMid && .25) || (smallToMid && .33) || (lessThanSmall && .5) || 1
  const cardWidthUnit = Math.floor(containerWidth*cardWidthRate/10)*10
  const pageLimit = 10

  React.useEffect(()=>{
    // if(publicChannels.length>0)
    //   return
    appendMoreData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  React.useEffect(()=>{
    handleResize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicChannels])
  
  const appendMoreData = () => {
    if(isLastPage)
      return
    const channelRegContract = getWeb3Contract(CHANNEL_REG_CONTRACT_ABI, ChannelRegContractAddress, false)
    channelRegContract.methods.channelIds(startChannelIndex, pageLimit).call()
      .then(res=>{
        if(Array.isArray(res)) {
          if(res.length < pageLimit)
            setIsLastPage(true)
          if(res.length)
            setStartChannelIndex(res[res.length-1])
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
                      const channelData = {...data}
                      channelData['channel_id'] = channelId
                      channelData['target_did'] = targetDid
                      if(channelData.data) {
                        channelData['avatarSrc'] = getIpfsUrl(channelData.data['avatar'])
                        channelData['bannerSrc'] = getIpfsUrl(channelData.data['banner'])
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
          })
        }
      })
  }
  const handleResize = () => {
    setContainerWidth(containerRef.current.clientWidth);
  }
  window.addEventListener("resize", handleResize);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  const getAutoResponsiveProps = () => {
    return {
      itemMargin: 0,
      containerWidth: containerWidth,
      itemClassName: "item",
      transitionDuration: .8,
      transitionTimingFunction: "easeIn",
      closeAnimation: false
    }
  }
  const getGridContent = React.useCallback(() => {
    let content = []
    if("01".includes(tabValue.toString())) {
      content = content.concat(
        Object.values(publicChannels).map((channel, _i)=>(
          <div className="item" key={_i} style={
            {
              width: cardWidthUnit,
              height: 240,
              paddingRight: 8,
              paddingBottom: 8,
            }
          }>
            <ChannelCard info={channel} key={_i}/>
          </div>
        ))
      )
    }
    if("02".includes(tabValue.toString())) {
      content = content.concat(
        latestPublicPosts.map((post, _i)=>{
          const isImageCard = !!post.content.mediaData && post.content.mediaData.length
          return <div className="item" key={_i} style={
            {
              width: isImageCard? 2*cardWidthUnit: cardWidthUnit,
              height: isImageCard? 400: 200,
              paddingRight: 8,
              paddingBottom: 8,
            }
          }>
            {
              isImageCard? <PostImgCard post={post}/>: <PostTextCard post={post}/>
            }
          </div>
        })
      )
    }
    return content
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue, publicChannels, publicPosts])

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
      <InfiniteScroll
        dataLength={Object.keys(publicChannels).length}
        next={appendMoreData}
        hasMore={!isLastPage}
        loader={<h4>Loading...</h4>}
        scrollableTarget="scrollableBox"
        style={{overflow: 'visible'}}
      >
        <Box ref={containerRef}>
          <Box pt={2}>
            <AutoResponsive {...getAutoResponsiveProps()}>
              {getGridContent()}
            </AutoResponsive>
          </Box>
          {/* <TabPanel value={tabValue} index={1}>
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
          </TabPanel>
          <TabPanel value={tabValue} index={4}>
          </TabPanel> */}
        </Box>
      </InfiniteScroll>
    </Container>
  );
}

export default Explore;
