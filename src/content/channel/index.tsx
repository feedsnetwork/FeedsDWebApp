import React from 'react'
import { Icon } from '@iconify/react';
import { Grid, Container, Box, Typography, Stack, styled, IconButton } from '@mui/material';
import { useSnackbar } from 'notistack';

import PostCard from 'src/components/PostCard';
import { EmptyView } from 'src/components/EmptyView'
import { SidebarContext } from 'src/contexts/SidebarContext';
import StyledButton from 'src/components/StyledButton';
import StyledIconButton from 'src/components/StyledIconButton';
import StyledTextFieldOutline from 'src/components/StyledTextFieldOutline'
import PostSkeleton from 'src/components/Skeleton/PostSkeleton'
import { PostContentV3 } from 'src/models/post_content'
import { reduceDIDstring, getAppPreference, sortByDate } from 'src/utils/common'
import { HiveApi } from 'src/services/HiveApi'

const PostBoxStyle = styled(Box)(({ theme }) => ({
  position: 'sticky',
  bottom: 0,
  zIndex: 1,
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  background: 'rgba(22, 28, 36, 0.8)',
  backdropFilter: 'blur(20px)',
}));

function Channel() {
  const { focusedChannelId, selfChannels } = React.useContext(SidebarContext);
  const [posts, setPosts] = React.useState([])
  const [dispName, setDispName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false)
  const { enqueueSnackbar } = useSnackbar();
  const prefConf = getAppPreference()
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const userDid = `did:elastos:${feedsDid}`
  const hiveApi = new HiveApi()
  const postRef = React.useRef()

  React.useEffect(()=>{
    if(focusedChannelId) {        
      // const postContent = new PostContentV3()
      // postContent.content = "This is new post"
      // hiveApi.updatePost("4d273607cd54b4850c086ecffd1b059aa7332b35e3c8a153b4d8178f4aa045fc", "396968a639f20908bbe51cba84f14f02620466fc6a103b2c277cc80b3ab22504", "public", "", JSON.stringify(postContent), 0, 1662041339625, "", "")
      //   .then(res=>{console.log(res, '%%%%%%%%%%%%%%%%%%%%%%%%')})
      setIsLoading(true)
      hiveApi.queryUserDisplayName(userDid, focusedChannelId.toString(), userDid)
        .then(res=>{
          if(res['find_message'])
            setDispName(res['find_message']['items'][0].display_name)
        })
      hiveApi.querySelfPostsByChannel(focusedChannelId.toString())
        .then(res=>{
          // console.log(res, "---------------------3")
          setIsLoading(false)
          if(Array.isArray(res)) {
            setPosts(
              sortByDate(
                prefConf.DP?
                res:
                res.filter(item=>!item.status)
              )
            )
          }
        })
    }
  }, [focusedChannelId])

  const handlePost = (e) => {
    if(!postRef['current'])
      return
    const postContent = new PostContentV3()
    postContent.content = postRef['current']['value']
    hiveApi.publishPost(focusedChannelId.toString(), "", JSON.stringify(postContent))
      .then(res=>{
        // console.log(res, "===============2")
        enqueueSnackbar('Publish post success', { variant: 'success' });
      })
  }

  const loadingSkeletons = Array(5).fill(null)
  return (
    <>
      {
        !selfChannels.length?
        <EmptyView type='channel'/>:

        <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
          <Container sx={{ mt: 3, flexGrow: 1, overFlow: 'auto' }} maxWidth={false}>
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
                    <PostCard post={post} dispName={dispName || reduceDIDstring(feedsDid)}/>
                  </Grid>
                ))
              }
            </Grid>
          </Container>
          <PostBoxStyle>
            <Stack spacing={2}>
              <StyledTextFieldOutline
                inputRef={postRef}
                multiline
                rows={3}
                placeholder="What's up"
              />
              <Stack direction='row'>
                <Box sx={{ alignItems: 'center', display: 'flex', flexGrow: 1 }}>
                  <StyledIconButton icon="clarity:picture-line"/>
                  <StyledIconButton icon="clarity:camera-line"/>
                  <StyledIconButton icon="clarity:video-gallery-line"/>
                  <StyledIconButton icon="clarity:video-camera-line"/>
                  <IconButton>
                    <Typography variant='body2' sx={{
                      backgroundImage: 'linear-gradient(90deg, #7624FE 0%, #368BFF 100%)',
                      backgroundSize: '100%',
                      backgroundRepeat: 'repeat',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      MozBackgroundClip: 'text',
                      MozTextFillColor: 'transparent',
                    }}>
                      NFT
                    </Typography>
                  </IconButton>
                </Box>
                <Box width={150}>
                  <StyledButton fullWidth onClick={handlePost}>Post</StyledButton>
                </Box>
              </Stack>
            </Stack>
          </PostBoxStyle>
        </Box>
      }
    </>
  );
}

export default Channel;
