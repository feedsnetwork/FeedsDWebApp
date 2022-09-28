import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Typography, Card, CardHeader, Divider, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';

import StyledAvatar from 'src/components/StyledAvatar'
import StyledButton from 'src/components/StyledButton'
import { SidebarContext } from 'src/contexts/SidebarContext';
import StyledTextFieldOutline from 'src/components/StyledTextFieldOutline'
import PostBody from './PostBody'
import { HiveApi } from 'src/services/HiveApi'
import { getDateDistance, isValidTime, reduceDIDstring, reduceHexAddress } from 'src/utils/common'

const PostCard = (props) => {
  const navigate = useNavigate();
  const { post, dispName, level=1, replyingTo='', replyable=false, dispNames={}, dispAvatar={}, direction='column' } = props
  const { selfChannels, subscribedChannels, myAvatar, userInfo, walletAddress, publishPostNumber, setPublishPostNumber } = React.useContext(SidebarContext);
  const currentChannel = [...selfChannels, ...subscribedChannels].find(item=>item.channel_id==post.channel_id) || {}
  
  const [isOnValidation, setOnValidation] = React.useState(false);
  const [onProgress, setOnProgress] = React.useState(false);
  const [commentext, setCommentext] = React.useState('');
  const commentRef = React.useRef(null)
  const hiveApi = new HiveApi()
  const feedsDid = sessionStorage.getItem('FEEDS_DID')

  const { enqueueSnackbar } = useSnackbar();

  const handleComment = async (e) => {
    setOnValidation(true)
    if(!commentext){
      commentRef.current.focus()
      return
    }
    setOnProgress(true)
    hiveApi.createComment(currentChannel.target_did, currentChannel.channel_id, post.post_id, '0', commentext)
      .then(res=>{
        // console.log(res, "===============2")
        enqueueSnackbar('Reply comment success', { variant: 'success' });
        setPublishPostNumber(publishPostNumber+1)
        setOnProgress(false)
      })
  }
  
  const handleChangeCommentext = (e) => {
    setCommentext(e.target.value)
  }
  
  const naviage2detail = (e) => {
    navigate(`/post/${post.post_id}`);
  }

  let contentObj = {avatar: {}, primaryName: '', secondaryName: null, content: ''}
  let cardProps = {}
  if(level == 1) {
    contentObj = JSON.parse(post.content)
    contentObj.avatar = { name: currentChannel.name, src: currentChannel.avatarSrc }
    contentObj.primaryName = currentChannel.name
    contentObj.secondaryName = `@${dispName}`
    cardProps = {style: {cursor: 'pointer'}, onClick: naviage2detail}
  } 
  else if(level == 2) {
    contentObj.avatar = dispAvatar[post.comment_id] || {}
    contentObj.content = post.content
    contentObj.primaryName = `@${dispName}`
    contentObj.secondaryName = <><b>Replying to</b> @{replyingTo}</>
  }
  if(post.status == 1)
    contentObj.content = "(post deleted)"

  const BodyProps = { post, contentObj, level, direction }
  return (
    <Card {...cardProps}>
      <Box p={3}>
        <PostBody {...BodyProps}/>
        {
          level==1 && replyable &&
          <Box pl={3} pt={2}>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <StyledAvatar alt="" src={myAvatar}/>
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography variant="subtitle2" noWrap>
                  {userInfo['name'] || reduceDIDstring(feedsDid)}
                </Typography>
                <Typography variant="body2" noWrap>
                  <b>Replying to</b> @{dispName}
                </Typography>
              </Box>
            </Stack>
            <Stack spacing={2}>
              <StyledTextFieldOutline
                inputRef={commentRef}
                value={commentext}
                multiline
                rows={3}
                placeholder="What are you thoughts?"
                onChange={handleChangeCommentext}
                error={isOnValidation&&!commentext}
                helperText={isOnValidation&&!commentext?'Message is required':''}
              />
              
              <Stack direction='row' sx={{justifyContent: 'end'}}>
                <Box width={150}>
                  <StyledButton fullWidth loading={onProgress} needLoading={true} onClick={handleComment}>Reply</StyledButton>
                </Box>
              </Stack>
            </Stack>
          </Box>
        }
        {
          level==2 && post.commentData && 
          <Stack pl={3} pt={2} spacing={1}>
            {
              post.commentData.map((comment, _i)=>{
                let subContentObj = {
                  avatar: dispAvatar[comment.comment_id] || {}, 
                  primaryName: comment.creater_did == currentChannel.target_did? `@${currentChannel.name}`: `@${dispNames[comment.comment_id] || reduceDIDstring(comment.creater_did)}`, 
                  secondaryName: <><b>Replying to</b> @{dispName}</>, 
                  content: comment.content
                }
                const subBodyProps = { post: comment, contentObj: subContentObj, isReply: true, level }
                return <PostBody {...subBodyProps} key={_i}/>
              })
            }
          </Stack>
        }
      </Box>
    </Card>
  );
}

export default PostCard;
