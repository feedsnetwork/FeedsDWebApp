import React from 'react'
import { useLocation } from 'react-router-dom';
import { isString } from 'lodash';
import { Icon } from '@iconify/react';
import { Grid, Container, Box, Typography, Stack, styled, IconButton, Paper } from '@mui/material';
import { useSnackbar } from 'notistack';
import closeFill from '@iconify/icons-eva/close-fill';

import PostCard from 'src/components/PostCard';
import { EmptyView } from 'src/components/EmptyView'
import { SidebarContext } from 'src/contexts/SidebarContext';
import StyledButton from 'src/components/StyledButton';
import StyledIconButton from 'src/components/StyledIconButton';
import StyledTextFieldOutline from 'src/components/StyledTextFieldOutline'
import PostSkeleton from 'src/components/Skeleton/PostSkeleton'
import { PostContentV3, mediaDataV3, MediaType } from 'src/models/post_content'
import { CommonStatus } from 'src/models/common_content'
import { reduceDIDstring, sortByDate } from 'src/utils/common'
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
  const location = useLocation();
  const { channel_id } = (location.state || {}) as any
  const { subscribedChannels, postsInSubs } = React.useContext(SidebarContext);
  const [isLoading, setIsLoading] = React.useState(false)
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const userDid = `did:elastos:${feedsDid}`
  const hiveApi = new HiveApi()
  const postRef = React.useRef(null)
  const activeChannel = subscribedChannels.find(item=>item.channel_id==channel_id)
  const postsInActiveChannel = sortByDate(postsInSubs[channel_id] || [])
  const dispName = activeChannel.owner_name
  
  React.useEffect(()=>{
    if(channel_id) {
      if(!postsInSubs[channel_id])
        setIsLoading(true)
      else
        setIsLoading(false)
    }
    console.log(postsInSubs, "---------12")
  }, [postsInSubs])

  const loadingSkeletons = Array(5).fill(null)
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <Container sx={{ mt: 3, flexGrow: 1, overFlow: 'auto' }} maxWidth="lg">
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

            postsInActiveChannel.map((post, _i)=>(
              <Grid item xs={12} key={_i}>
                <PostCard post={post} dispName={dispName || reduceDIDstring(feedsDid)}/>
              </Grid>
            ))
          }
        </Grid>
        {
          !isLoading && !postsInActiveChannel.length &&
          <Typography variant='h5' sx={{mt: 3, textAlign: 'center'}}>No posts found!</Typography>
        }
      </Container>
    </Box>
  );
}

export default Channel;
