import { useContext } from 'react';
import { Box, Stack, Typography, Card, CardHeader, Divider, lighten, CardActionArea, CardContent, Tooltip, IconButton, Avatar, styled } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import StyledAvatar from 'src/components/StyledAvatar'
import StyledButton from 'src/components/StyledButton'
import { SidebarContext } from 'src/contexts/SidebarContext';
import { getDateDistance, isValidTime } from 'src/utils/common'

const PostCard = (props) => {
  const { post, dispName } = props
  const { selfChannels, subscribedChannels } = useContext(SidebarContext);
  const currentChannel = [...selfChannels, ...subscribedChannels].find(item=>item.channel_id==post.channel_id) || {}
  const postObj = JSON.parse(post.content)
  if(post.status == 1)
    postObj.content = "(post deleted)"

  const distanceTime = isValidTime(post.created)?getDateDistance(post.created):''
  
  return (
    <Card>
      <Box p={3}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <StyledAvatar alt={currentChannel.name} src={currentChannel.avatarSrc}/>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography component='div' variant="subtitle2" noWrap>
                {currentChannel.name}{' '}<Typography variant="body2" color="text.secondary" sx={{display: 'inline'}}>{distanceTime}</Typography>
              </Typography>
              <Typography variant="body2" noWrap>
                @{dispName}
              </Typography>
            </Box>
            <Box>
              <IconButton aria-label="settings" size='small'>
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Stack>
          <Typography variant="body2" sx={{whiteSpace: 'pre-line'}}>
            {postObj.content}
          </Typography>
        </Stack>
      </Box>
    </Card>
  );
}

export default PostCard;
