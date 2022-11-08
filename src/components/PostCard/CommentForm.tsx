
import React from 'react'
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { Box, Stack, Typography } from '@mui/material';

import StyledAvatar from 'components/StyledAvatar'
import StyledButton from 'components/StyledButton'
import StyledTextFieldOutline from 'components/StyledTextFieldOutline'
import { SidebarContext } from 'contexts/SidebarContext';
import { selectMyInfo } from 'redux/slices/user';
import { HiveApi } from 'services/HiveApi'
import { decodeBase64, reduceDIDstring } from 'utils/common'
import { getLocalDB } from 'utils/db';

export const CommentForm = (props)=>{
    const { post, dispName } = props
    const { publishPostNumber, setPublishPostNumber } = React.useContext(SidebarContext);
    const [isOnValidation, setOnValidation] = React.useState(false);
    const [onProgress, setOnProgress] = React.useState(false);
    const [commentext, setCommentext] = React.useState('');
    const myInfo = useSelector(selectMyInfo)
    const feedsDid = sessionStorage.getItem('FEEDS_DID')
    const commentRef = React.useRef(null)
    const hiveApi = new HiveApi()
    const LocalDB = getLocalDB()
    const { enqueueSnackbar } = useSnackbar();
    
    const handleComment = async (e) => {
        setOnValidation(true)
        if(!commentext){
            commentRef.current.focus()
            return
        }
        setOnProgress(true)
        hiveApi.createComment(post.target_did, post.channel_id, post.post_id, '0', commentext)
            .then(res=>hiveApi.queryCommentByID(post.target_did, post.channel_id, post.post_id, res.commentId))
            .then(res=>{
                if(res['find_message'] && res['find_message']['items'].length) {
                const createdComment = res['find_message']['items'][0]
                const newCommentObj = {
                    ...createdComment,
                    _id: createdComment.comment_id, 
                    target_did: post.target_did, 
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
                setCommentext('')
            })
            .catch(err=>{
                enqueueSnackbar('Reply comment error', { variant: 'error' });
                setOnProgress(false)
            })
    }
    
    const handleChangeCommentext = (e) => {
        setCommentext(e.target.value)
    }
    
    return (
        <Box pl={3} pt={2}>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <StyledAvatar alt="" src={decodeBase64(myInfo['avatarSrc'])}/>
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography variant="subtitle2" noWrap>
                  {myInfo['name'] || reduceDIDstring(feedsDid)}
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
    )
}