import React from 'react'
import { Grid, Container, Box, Typography, Stack } from '@mui/material';

import PostCard from 'src/components/PostCard';
import { EmptyView } from 'src/components/EmptyView'
import { reduceDIDstring, getAppPreference, sortByDate } from 'src/utils/common'
import { HiveApi } from 'src/services/HiveApi'

const Home = () => {
  const [posts, setPosts] = React.useState([])
  const [dispNames, setDispNames] = React.useState({})
  const prefConf = getAppPreference()
  const hiveApi = new HiveApi()

  React.useEffect(()=>{
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
                  postArr.map(post=>{post.target_did = splitTargetDid[splitTargetDid.length-1]})
                  setPosts((prevState)=>([...prevState, ...postArr]))
                  // console.log(postArr, "---------------------3")
                }
              })
          })
        }
      })
  }, [])
  
  const postsInSort = sortByDate([...posts])
  return (
    <>
      {
        !posts.length?
        <EmptyView/>:

        <Container sx={{ mt: 3 }} maxWidth="lg">
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="stretch"
            spacing={3}
          >
            {
              postsInSort.map((post, _i)=>(
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
