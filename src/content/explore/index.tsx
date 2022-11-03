import React from 'react'
// import InfiniteScroll from "react-infinite-scroll-component";
import { Box, Tabs, Tab, Stack, Container, InputAdornment } from '@mui/material';
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import AutoResponsive from 'autoresponsive-react'

import ChannelCard from 'components/ChannelCard'
import PostTextCard from 'components/PostCard/PostTextCard'
import PostImgCard from 'components/PostCard/PostImgCard'
import InputOutline from 'components/InputOutline'
import { SidebarContext } from 'contexts/SidebarContext';
// import { selectPublicChannels, setPublicChannels, setDispNameOfChannels } from 'redux/slices/channel';
// import { selectPublicPosts, setPublicPosts, updateMediaOfPosts } from 'redux/slices/post';
import { getMergedArray, sortByDate } from 'utils/common'
import { LocalDB, QueryStep } from 'utils/db';

function Explore() {
  const { queryPublicStep, queryPublicFlag } = React.useContext(SidebarContext);
  const [tabValue, setTabValue] = React.useState(0);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [publicChannels, setPublicChannels] = React.useState([])
  const [publicPosts, setPublicPosts] = React.useState([])
  // const publicChannels = useSelector(selectPublicChannels)
  // const publicPosts = useSelector(selectPublicPosts)
  const latestPublicPosts = sortByDate(getMergedArray(publicPosts)).slice(0, 10)
  const containerRef = React.useRef(null)
  const theme = useTheme();
  const greaterThanMid = useMediaQuery(theme.breakpoints.up("md"));
  const smallToMid = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const lessThanSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const cardWidthRate = (greaterThanMid && .25) || (smallToMid && .33) || (lessThanSmall && .5) || 1
  const cardWidthUnit = Math.floor(containerWidth*cardWidthRate/10)*10

  React.useEffect(()=>{
    if((queryPublicStep >= QueryStep.public_channel && !publicChannels.length) || queryPublicFlag >= QueryStep.public_channel) {
      LocalDB.find({
        selector: {
          table_type: 'public-channel'
        },
      })
        .then(response=>{
          // console.info(response.docs)
          setPublicChannels(response.docs)
        })
    }
    if((queryPublicStep >= QueryStep.post_data && !publicChannels.length) || queryPublicFlag >= QueryStep.post_data) {
      LocalDB.find({
        selector: {
          table_type: 'public-post'
        },
      })
        .then(response=>{
          setPublicPosts(response.docs)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryPublicStep, queryPublicFlag])

  React.useEffect(()=>{
    handleResize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicChannels])
  
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
        Object.values(publicChannels).map((channel, _i)=>(
          <div className="item" key={channel.channel_id} style={
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
          const isImageCard = post.mediaData && post.mediaData.length
          return <div className="item" key={post.post_id} style={
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
    </Container>
  );
}

export default Explore;
