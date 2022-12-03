import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogTitle, DialogContent, Typography, Box, Stack, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSnackbar } from 'notistack';

import StyledAvatar from '../StyledAvatar';
import StyledButton from '../StyledButton';
import StyledTextFieldOutline from '../StyledTextFieldOutline'
import PostBody from '../PostCard/PostBody'
import { HiveApi } from 'services/HiveApi'
import { SidebarContext } from 'contexts/SidebarContext';
import { handleCommentModal, selectActivePost, selectActivePostProps, selectCommentModalState } from 'redux/slices/post';
import { selectMyInfo } from 'redux/slices/user';
import { reduceDIDstring, decodeBase64 } from 'utils/common'
import { getLocalDB } from 'utils/db';
import { selectChannelById } from 'redux/slices/channel';

function CommentDlg() {
  const { publishPostNumber, setPublishPostNumber } = React.useContext(SidebarContext);
  const [isOnValidation, setOnValidation] = React.useState(false);
  const [onProgress, setOnProgress] = React.useState(false);
  const [commentext, setCommentext] = React.useState('');
  const commentRef = React.useRef(null)
  
  const dispatch = useDispatch()
  const isOpen = useSelector(selectCommentModalState)
  const activePost = useSelector(selectActivePost)
  const activePostProps = useSelector(selectActivePostProps)
  const currentChannel = useSelector(selectChannelById(activePost?.channel_id)) || {}
  const myInfo = useSelector(selectMyInfo)

  const { enqueueSnackbar } = useSnackbar();
  const hiveApi = new HiveApi()
  const LocalDB = getLocalDB()
  const feedsDid = localStorage.getItem('FEEDS_DID')
  
  React.useEffect(()=>{
    if(!isOpen) {
      setOnValidation(false)
      setCommentext('')
      setOnProgress(false)
    }
  }, [isOpen])

  const handlePost = async (e) => {
    setOnValidation(true)
    if(!commentext){
      commentRef.current.focus()
      return
    }
    setOnProgress(true)
    hiveApi.createComment(currentChannel['target_did'], currentChannel['channel_id'], activePost['post_id'], '0', commentext)
      .then(res=>hiveApi.queryCommentByID(currentChannel['target_did'], currentChannel['channel_id'], activePost['post_id'], res.commentId))
      .then(res=>{
        if(res['find_message'] && res['find_message']['items'].length) {
          const createdComment = res['find_message']['items'][0]
          const newCommentObj = {
            ...createdComment,
            _id: createdComment.comment_id, 
            target_did: currentChannel['target_did'], 
            table_type: 'comment',
            likes: 0,
            like_me: false,
            like_creators: []
          }
          return LocalDB.put(newCommentObj)
        }
      })
      .then(_=>{
        enqueueSnackbar('Reply comment success', { variant: 'success' });
        setPublishPostNumber(publishPostNumber+1)
        setOnProgress(false)
        handleClose()
      })
      .catch(err=>{
        enqueueSnackbar('Reply comment error', { variant: 'error' });
        setOnProgress(false)
      })
  }
  const handleChangecommentext = (e) => {
    setCommentext(e.target.value)
  }
  
  const handleClose = () => {
    handleCommentModal(false)(dispatch)
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} onClick={(e)=>{e.stopPropagation()}}>
      <DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{minWidth: {sm: 'unset', md: 500}}}>
        <PostBody post={activePost} {...activePostProps}/>
        <Stack direction="row" spacing={1} alignItems="center" mb={2} mt={2}>
          <StyledAvatar alt={myInfo.name} src={decodeBase64(myInfo['avatarSrc'])} width={40}/>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {myInfo['name'] || reduceDIDstring(feedsDid)}
            </Typography>
            <Typography variant="body2" noWrap>
              <b>Replying to</b> {activePostProps.level === 1? activePostProps?.contentObj?.secondaryName: activePostProps?.contentObj?.primaryName}
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
            onChange={handleChangecommentext}
            error={isOnValidation&&!commentext}
            helperText={isOnValidation&&!commentext?'Message is required':''}
          />
          <Stack direction='row' sx={{justifyContent: 'end'}}>
            <Box width={150}>
              <StyledButton fullWidth loading={onProgress} needLoading={true} onClick={handlePost}>Reply</StyledButton>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default CommentDlg