import React from 'react'
import { Grid, Container, Box, Typography, Stack } from '@mui/material';

import PostCard from 'src/components/PostCard';
import { EmptyView } from 'src/components/EmptyView'
import PostSkeleton from 'src/components/Skeleton/PostSkeleton'
import { reduceDIDstring, getAppPreference, sortByDate } from 'src/utils/common'
import { SidebarContext } from 'src/contexts/SidebarContext';
import { HiveApi } from 'src/services/HiveApi'

const Home = () => {
  const { publishPostNumber } = React.useContext(SidebarContext);
  const [posts, setPosts] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [dispNames, setDispNames] = React.useState({})
  const prefConf = getAppPreference()
  const hiveApi = new HiveApi()

  React.useEffect(()=>{
    setIsLoading(true)
    hiveApi.queryBackupData()
      .then(res=>{
        if(Array.isArray(res)) {
          res.forEach(item=>{
            hiveApi.queryUserDisplayName(item.target_did, item.channel_id, item.target_did)
              .then(dispNameRes=>{
                if(dispNameRes['find_message'] && dispNameRes['find_message']['items']) {
                  const dispItem = dispNameRes['find_message']['items'][0]
                  setDispNames(prevState=>{
                    const tempPrev = {...prevState}
                    tempPrev[dispItem.channel_id] = dispItem.display_name
                    return tempPrev
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
                            setPosts(prev=>{
                              const prevState = [...prev]
                              const postIndex = prevState.findIndex(el=>el.post_id==post.post_id)
                              if(postIndex<0)
                                return prevState
                              if(prevState[postIndex].mediaData)
                                prevState[postIndex].mediaData.push({...media, mediaSrc: res})
                              else
                                prevState[postIndex].mediaData = [{...media, mediaSrc: res}]
                              return prevState
                            })
                          }
                        })
                        .catch(err=>{
                          console.log(err)
                        })
                    })
                    hiveApi.queryLikeByPost(item.target_did, item.channel_id, post.post_id)
                      .then(likeRes=>{
                        if(likeRes['find_message'] && likeRes['find_message']['items']) {
                          const likeArr = likeRes['find_message']['items']
                          setPosts(prev=>{
                            const prevState = [...prev]
                            const postIndex = prevState.findIndex(el=>el.post_id==post.post_id)
                            if(postIndex<0)
                              return prevState
                            prevState[postIndex].likes = likeArr.length
                            return prevState
                          })
                        }
                        // console.log(likeRes, "--------------5")
                      })
                  })
                  const postIds = postArr.map(post=>post.post_id)
                  hiveApi.queryCommentsFromPosts(item.target_did, item.channel_id, postIds)
                    .then(commentRes=>{
                      if(commentRes['find_message'] && commentRes['find_message']['items']) {
                        const commentArr = commentRes['find_message']['items']
                        commentArr.forEach(comment=>{
                          setPosts(prev=>{
                            const prevState = [...prev]
                            const postIndex = prevState.findIndex(el=>el.post_id==comment.post_id)
                            if(postIndex<0)
                              return prevState
                            if(prevState[postIndex].commentData)
                              prevState[postIndex].commentData.push(comment)
                            else
                              prevState[postIndex].commentData = [comment]
                            return prevState
                          })
                        })
                      }
                      // console.log(commentRes, "--------------6")
                    })
                  setIsLoading(false)
                  setPosts((prevState)=>sortByDate([...prevState, ...postArr]))
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
        !isLoading && !posts.length?
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

              posts.map((post, _i)=>(
                <Grid item xs={12} key={_i}>
                  <PostCard post={post} dispName={dispNames[post.channel_id] || reduceDIDstring(post.target_did)}/>
                </Grid>
              ))
            }
          </Grid>
        </Container>
      }
      {/* <Footer /> */}
    </>
  );
}

export default Home;
