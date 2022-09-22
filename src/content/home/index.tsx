import React from 'react'
import { Grid, Container, Box, Typography, Stack } from '@mui/material';

import PostCard from 'src/components/PostCard';
import { EmptyView } from 'src/components/EmptyView'
import PostSkeleton from 'src/components/Skeleton/PostSkeleton'
import { SidebarContext } from 'src/contexts/SidebarContext';
import { reduceDIDstring, getAppPreference, sortByDate, getFilteredArrayByUnique, getMergedArray } from 'src/utils/common'
import { HiveApi } from 'src/services/HiveApi'

const Home = () => {
  const { publishPostNumber, postsInSubs, subscribedChannels, setPostsInSubs } = React.useContext(SidebarContext);
  const [isLoading, setIsLoading] = React.useState(false)
  const prefConf = getAppPreference()
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const userDid = `did:elastos:${feedsDid}`
  const hiveApi = new HiveApi()
  const postsInHome = sortByDate(getMergedArray(postsInSubs))

  React.useEffect(()=>{
    if(Object.keys(postsInSubs).length)
      return
    setIsLoading(true)
    hiveApi.queryBackupData()
      .then(res=>{
        if(Array.isArray(res)) {
          res.forEach(item=>{
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
                  setIsLoading(false)
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
  }, [publishPostNumber])
  
  const loadingSkeletons = Array(5).fill(null)

  return (
    <>
      {
        !isLoading && !postsInHome.length?
        <EmptyView/>:

        <Container sx={{ my: 3 }} maxWidth="lg">
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="stretch"
            spacing={3}
          >
            {
              isLoading?
              loadingSkeletons.map((_, _i)=>(
                <Grid item xs={12} key={_i}>
                  <PostSkeleton/>
                </Grid>
              )):

              postsInHome.map((post, _i)=>{
                const channelOfPost = subscribedChannels.find(item=>item.channel_id==post.channel_id) || {}
                return <Grid item xs={12} key={_i}>
                  <PostCard post={post} dispName={channelOfPost['owner_name'] || reduceDIDstring(post.target_did)}/>
                </Grid>
              })
            }
          </Grid>
        </Container>
      }
      {/* <Footer /> */}
    </>
  );
}

export default Home;
