import { useContext } from 'react';
import { Box, Stack, Typography, Card, CardHeader, Divider, lighten, CardActionArea, CardContent, Tooltip, IconButton, Avatar, styled } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import StyledAvatar from 'src/components/StyledAvatar'
import StyledButton from 'src/components/StyledButton'
import { SidebarContext } from 'src/contexts/SidebarContext';
import { HiveApi } from 'src/services/HiveApi'

const PostCard = (props) => {
  const { post, dispName } = props
  const { focusedChannelId, selfChannels } = useContext(SidebarContext);
  const focusedChannel = selfChannels.find(item=>item.channel_id==focusedChannelId)
  const postObj = JSON.parse(post.content)

  return (
    <Card>
      <Box p={3}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <StyledAvatar alt={focusedChannel.name} src={focusedChannel.avatarSrc}/>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography component='div' variant="subtitle2" noWrap>
                {focusedChannel.name}{' '}<Typography variant="body2" sx={{display: 'inline'}}>1m</Typography>
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
