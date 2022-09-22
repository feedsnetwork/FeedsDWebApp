import React from 'react';
import Scrollbar from 'src/components/Scrollbar';
import { SidebarContext } from 'src/contexts/SidebarContext';

import { Box, Drawer, alpha, styled, Divider, useTheme, Button, Stack, Avatar, Tooltip, Typography } from '@mui/material';

import SidebarMenu from './SidebarMenu';
import Logo from 'src/components/LogoSign';
import StyledAvatar from 'src/components/StyledAvatar'
import { HiveApi } from 'src/services/HiveApi'
import { reduceDIDstring, getInfoFromDID, reduceHexAddress, getAppPreference, getFilteredArrayByUnique, sortByDate } from 'src/utils/common'

const SidebarWrapper = styled(Box)(
  ({ theme }) => `
        width: ${theme.sidebar.width};
        min-width: ${theme.sidebar.width};
        color: ${theme.colors.alpha.trueWhite[70]};
        position: relative;
        z-index: 7;
        height: 100%;
`
);

function Sidebar() {
  const { sidebarToggle, walletAddress, myAvatar, userInfo, subscriberAvatar, 
    toggleSidebar, setSubscribedChannels, setMyAvatar, setUserInfo, setSubscriberAvatar, setPostsInSubs } = React.useContext(SidebarContext);
  const closeSidebar = () => toggleSidebar();
  const theme = useTheme();
  const prefConf = getAppPreference()
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const userDid = `did:elastos:${feedsDid}`
  const hiveApi = new HiveApi()
  
  React.useEffect(()=>{
    if(!feedsDid)
      return
      
    hiveApi.getHiveUrl(userDid)
      .then(async hiveUrl=>{
        const res =  await hiveApi.downloadFileByHiveUrl(userDid, hiveUrl)
        if(res && res.length) {
          const base64Content = res.toString('base64')
          setMyAvatar(`data:image/png;base64,${base64Content}`)
        }
      })

    hiveApi.queryBackupData()
      .then(backupRes=>{
        if(Array.isArray(backupRes)) {
          backupRes.forEach(item=>{
            hiveApi.queryChannelInfo(item.target_did, item.channel_id)
              .then(res=>{
                if(res['find_message'] && res['find_message']['items'].length) {
                  const channelInfo = res['find_message']['items'][0]
                  setSubscribedChannels(prev=>{
                    return [...prev, {...channelInfo, target_did: item.target_did}]
                  })
                  hiveApi.queryUserDisplayName(item.target_did, item.channel_id, item.target_did)
                    .then(dispNameRes=>{
                      if(dispNameRes['find_message'] && dispNameRes['find_message']['items'].length) {
                        const dispName = dispNameRes['find_message']['items'][0].display_name
                        setSubscribedChannels(prev=>{
                          const prevState = [...prev]
                          const channelIndex = prevState.findIndex(channel=>channel.channel_id==item.channel_id)
                          if(channelIndex<0)
                            return prevState
                          prevState[channelIndex].owner_name = dispName
                          return prevState
                        })
                      }
                    })
                  hiveApi.querySubscriptionInfoByChannelId(item.target_did, item.channel_id)
                    .then(subscriptionRes=>{
                      if(subscriptionRes['find_message']) {
                        const subscribersArr = subscriptionRes['find_message']['items']
                        subscribersArr.forEach((subscriber, _i)=>{
                          if(subscriberAvatar[subscriber.user_did] === undefined) {
                            setSubscriberAvatar((prev)=>{
                              const tempState = {...prev}
                              tempState[subscriber.user_did] = ''
                              return tempState
                            })
                            hiveApi.getHiveUrl(subscriber.user_did)
                              .then(async hiveUrl=>{
                                try {
                                  const response =  await hiveApi.downloadFileByHiveUrl(subscriber.user_did, hiveUrl)
                                  if(response && response.length) {
                                    const base64Content = response.toString('base64')
                                    setSubscriberAvatar((prev)=>{
                                      const tempState = {...prev}
                                      tempState[subscriber.user_did] = `data:image/png;base64,${base64Content}`
                                      return tempState
                                    })
                                  }
                                } catch(err) {}
                              })
                          }
                        })
                        setSubscribedChannels(prev=>{
                          const prevState = [...prev]
                          const channelIndex = prevState.findIndex(channel=>channel.channel_id==item.channel_id)
                          if(channelIndex>=0)
                            prevState[channelIndex]['subscribers'] = subscribersArr
                          return prevState
                        })
                      }
                        
                    })
                  hiveApi.downloadScripting(item.target_did, channelInfo.avatar)
                    .then(downloadRes=>{
                      setSubscribedChannels(prev=>{
                        const prevState = [...prev]
                        const channelIndex = prevState.findIndex(channel=>channel.channel_id==channelInfo.channel_id)
                        if(channelIndex<0)
                          return prevState
                        prevState[channelIndex].avatarSrc = downloadRes
                        return prevState
                      })
                    })
                    .catch(err=>{
                      console.log(err)
                    })
                }
              })
            hiveApi.queryPostByChannelId(item.target_did, item.channel_id)
              .then(postRes=>{
                if(postRes['find_message'] && postRes['find_message']['items']) {
                  const postArr = prefConf.DP?
                    postRes['find_message']['items']:
                    postRes['find_message']['items'].filter(postItem=>!postItem.status)
                  const splitTargetDid = item.target_did.split(':')
                  postArr.map(post=>{
                    post.target_did = splitTargetDid[splitTargetDid.length-1]
                    if(typeof post.created == 'object')
                      post.created = new Date(post.created['$date']).getTime()/1000
                  })
                  postArr.forEach(post=>{
                    const contentObj = JSON.parse(post.content)
                    contentObj.mediaData.forEach((media, _i)=>{
                      if(!media.originMediaPath)
                        return
                      hiveApi.downloadScripting(item.target_did, media.originMediaPath)
                        .then(res=>{
                          if(res) {
                            setPostsInSubs((prevState) => {
                              const tempState = {...prevState}
                              const currentGroup = tempState[item.channel_id]
                              const postIndex = currentGroup.findIndex(el=>el.post_id==post.post_id)
                              if(postIndex<0)
                                return tempState
                              if(currentGroup[postIndex].mediaData)
                                currentGroup[postIndex].mediaData.push({...media, mediaSrc: res})
                              else
                                currentGroup[postIndex].mediaData = [{...media, mediaSrc: res}]
                              return tempState
                            })
                          }
                        })
                        .catch(err=>{
                          console.log(err)
                        })
                    })
                    hiveApi.queryLikeById(item.target_did, item.channel_id, post.post_id, '0')
                      .then(likeRes=>{
                        if(likeRes['find_message'] && likeRes['find_message']['items']) {
                          const likeArr = likeRes['find_message']['items']
                          const filteredLikeArr = getFilteredArrayByUnique(likeArr, 'creater_did')
                          const likeIndexByMe = filteredLikeArr.findIndex(item=>item.creater_did==userDid)

                          setPostsInSubs((prevState) => {
                            const tempState = {...prevState}
                            const currentGroup = tempState[item.channel_id]
                            const postIndex = currentGroup.findIndex(el=>el.post_id==post.post_id)
                            if(postIndex<0)
                              return tempState
                            currentGroup[postIndex].likes = filteredLikeArr.length
                            currentGroup[postIndex].like_me = likeIndexByMe>=0
                            return tempState
                          })
                        }
                        // console.log(likeRes, "--------------5", post)
                      })
                  })
                  const postIds = postArr.map(post=>post.post_id)
                  hiveApi.queryCommentsFromPosts(item.target_did, item.channel_id, postIds)
                    .then(commentRes=>{
                      if(commentRes['find_message'] && commentRes['find_message']['items']) {
                        const commentArr = commentRes['find_message']['items']
                        const ascCommentArr = sortByDate(commentArr, 'asc')
                        const linkedComments = ascCommentArr.reduce((res, item)=>{
                          if(item.refcomment_id == '0') {
                              res.push(item)
                              return res
                          }
                          const tempRefIndex = res.findIndex((c) => c.comment_id == item.refcomment_id)
                          if(tempRefIndex<0){
                              res.push(item)
                              return res
                          }
                          if(res[tempRefIndex]['commentData'])
                              res[tempRefIndex]['commentData'].push(item)
                          else res[tempRefIndex]['commentData'] = [item]
                          return res
                        }, []).reverse()
                      
                        linkedComments.forEach(comment=>{
                          setPostsInSubs((prevState) => {
                            const tempState = {...prevState}
                            const currentGroup = tempState[item.channel_id]
                            const postIndex = currentGroup.findIndex(el=>el.post_id==comment.post_id)
                            if(postIndex<0)
                              return tempState
                            if(currentGroup[postIndex].commentData)
                              currentGroup[postIndex].commentData.push(comment)
                            else
                              currentGroup[postIndex].commentData = [comment]
                            return tempState
                          })
                        })
                      }
                      // console.log(commentRes, "--------------6")
                    })
                  setPostsInSubs((prevState) => {
                    const tempState = {...prevState}
                    tempState[item.channel_id] = sortByDate(postArr)
                    return tempState
                  })
                  // console.log(postArr, "---------------------3")
                }
              })
          })
        }
      })

    // hiveApi.querySubscriptionInfoByUserDID(userDid, userDid)
    //   .then(res=>{
    //     console.log(res, "88888888888")
    //   })

    getInfoFromDID(userDid).then(res=>{
      setUserInfo(res)
    })
  }, [])

  return (
    <>
      <SidebarWrapper
        sx={{
          display: {
            xs: 'none',
            lg: 'table'
          },
          background: theme.sidebar.background,
          boxShadow:
            theme.palette.mode === 'dark' ? theme.sidebar.boxShadow : 'none'
        }}
      >
        <Box sx={{ display: 'table-row', height: '100%' }}>
          <Scrollbar>
            <Box mt={3} mb={4}>
              <Box mx={2}>
                <Typography
                  variant="h4"
                  sx={{ pt: 1, }}
                >
                  Feeds Network
                </Typography>
              </Box>
            </Box>
            <SidebarMenu/>
          </Scrollbar>
        </Box>
        <Divider
          sx={{
            background: theme.colors.alpha.trueWhite[10]
          }}
        />
        <Box p={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <StyledAvatar alt="" src={myAvatar} width={36}/>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="subtitle2" noWrap>
                {userInfo['name'] || reduceHexAddress(walletAddress)}
              </Typography>
              <Typography variant="body2" noWrap>
                {reduceDIDstring(userDid)}
              </Typography>
            </Box>
          </Stack>
          {/* <Button
            href="https://bloomui.com"
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            color="success"
            size="small"
            fullWidth
          >
            Upgrade to PRO
          </Button> */}
        </Box>
      </SidebarWrapper>
      {/* <Drawer
        sx={{
          boxShadow: `${theme.sidebar.boxShadow}`
        }}
        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
        open={sidebarToggle}
        onClose={closeSidebar}
        variant="temporary"
        elevation={9}
      >
        <SidebarWrapper
          sx={{
            background:
              theme.palette.mode === 'dark'
                ? theme.colors.alpha.white[100]
                : darken(theme.colors.alpha.black[100], 0.5)
          }}
        >
          <Scrollbar>
            <Box mt={3}>
              <Box
                mx={2}
                sx={{
                  width: 52
                }}
              >
                <Logo />
              </Box>
            </Box>
            <Divider
              sx={{
                mt: theme.spacing(3),
                mx: theme.spacing(2),
                background: theme.colors.alpha.trueWhite[10]
              }}
            />
            <SidebarMenu />
          </Scrollbar>
        </SidebarWrapper>
      </Drawer> */}
    </>
  );
}

export default Sidebar;
