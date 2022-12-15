import React from 'react'
import { useLocation } from 'react-router';
import { useSelector } from 'react-redux';
// import InfiniteScroll from "react-infinite-scroll-component";
import { Box, Tabs, Tab, Stack, Container } from '@mui/material';
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
// import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import AutoResponsive from 'autoresponsive-react'

import ChannelCard from 'components/ChannelCard'
import PostTextCard from 'components/PostCard/PostTextCard'
import PostImgCard from 'components/PostCard/PostImgCard'
// import InputOutline from 'components/InputOutline'
import { selectPublicChannels } from 'redux/slices/channel';
import { getMergedArray, shuffleArray, sortByDate, spreadArrayByShuffledIndex } from 'utils/common'
import { getLocalDB } from 'utils/db';
import { selectQueryPublicStep } from 'redux/slices/proc';

function Explore() {
  const location = useLocation();
  const { tab=0 } = (location.state || {}) as any
  const currentPublicPostStep = useSelector(selectQueryPublicStep('post_data'))
  const [tabValue, setTabValue] = React.useState(tab);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [publicPosts, setPublicPosts] = React.useState([])
  const [shuffledIndexArr, setShuffledIndexArr] = React.useState([])
  const publicChannels = useSelector(selectPublicChannels)
  const publicChannelArr = Object.values(publicChannels)
  const latestPublicPosts = sortByDate(getMergedArray(publicPosts)).slice(0, 10)
  const containerRef = React.useRef(null)
  const theme = useTheme();
  const greaterThanMid = useMediaQuery(theme.breakpoints.up("md"));
  const smallToMid = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const lessThanSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const cardWidthRate = (greaterThanMid && .25) || (smallToMid && .33) || (lessThanSmall && .5) || 1
  const cardWidthUnit = Math.floor(containerWidth*cardWidthRate/10)*10
  const LocalDB = getLocalDB()

  React.useEffect(()=>{
    if(currentPublicPostStep && !publicPosts.length) {
      LocalDB.find({
        selector: {
          table_type: 'channel',
          is_public: true
        },
      })
        .then(response=>{
          const publicChannelIDs = response.docs.map(doc=>doc._id)
          return LocalDB.find({
            selector: {
              table_type: 'post',
              channel_id: { $in: publicChannelIDs },
              created_at: { $gt: true }
            },
            sort: [{'created_at': 'desc'}],
            limit: 10
          })
        })
        .then(response=>{
          setPublicPosts(response.docs)
        })
        .catch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPublicPostStep])

  React.useEffect(()=>{
    handleResize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicChannelArr.length])

  React.useEffect(()=>{
    const tempIndexArr = new Array(publicChannelArr.length+publicPosts.length).fill(0).map((_, i)=>i)
    setShuffledIndexArr(shuffleArray(tempIndexArr))
  }, [publicChannelArr.length, publicPosts.length])
  
  const handleResize = () => {
    if(containerRef.current)
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
        publicChannelArr.map((channel, _i)=>(
          <div className="item" key={channel['channel_id']} style={
            {
              width: cardWidthUnit,
              height: 240,
              paddingRight: 8,
              paddingBottom: 8,
            }
          }>
            <ChannelCard channel={channel} key={_i}/>
          </div>
        ))
      )
    }
    if("02".includes(tabValue.toString())) {
      content = content.concat(
        latestPublicPosts.map((post, _i)=>{
          const isImageCard = post.mediaData && post.mediaData.length
          return <div className="item" key={post.post_id} style={
            {
              width: isImageCard? 2*cardWidthUnit: cardWidthUnit,
              height: isImageCard? 488: 240,
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
    // return shuffleArray(content)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue, publicChannels, publicPosts])

  let gridData = getGridContent()
  gridData = spreadArrayByShuffledIndex(gridData, shuffledIndexArr, tabValue===2? publicChannels.length: 0)

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
            {/* <Tab label="Hashtags" />
            <Tab label="NFTs" /> */}
        </Tabs>
        {/* <InputOutline
          type="text"
          placeholder="Search"
          size="small"
          startAdornment={
            <InputAdornment position="start">
              <SearchTwoToneIcon />
            </InputAdornment>
          }
          style={{flexGrow: 1}}
        /> */}
      </Stack>
      <Box ref={containerRef}>
        <Box pt={2}>
          <AutoResponsive {...getAutoResponsiveProps()}>
            {gridData}
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
    </Container>
  );
}

export default Explore;
