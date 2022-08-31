import React from 'react';
import { Box, Stack, Typography, Card, CardHeader, Divider, lighten, CardActionArea, CardContent, Tooltip, IconButton, Avatar, styled } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import StyledAvatar from 'src/components/StyledAvatar'
import StyledButton from 'src/components/StyledButton'
import { SidebarContext } from 'src/contexts/SidebarContext';
import { HiveApi } from 'src/services/HiveApi'
import { reduceDIDstring } from 'src/utils/common'

const ChannelCard = (props) => {
  const { channel } = props
  const [dispName, setDispName] = React.useState('');
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const userDid = `did:elastos:${feedsDid}`
  const hiveApi = new HiveApi()
  
  React.useEffect(()=>{
    hiveApi.queryUserDisplayName(userDid, channel.channel_id.toString(), userDid)
      .then(res=>{
        if(res['find_message'])
          setDispName(res['find_message']['items'][0].display_name)
      })
  }, [])

  return (
    <Card>
      <Box p={3}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <StyledAvatar alt={channel.name} src={channel.avatarSrc}/>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography component='div' variant="subtitle2" noWrap>
                {channel.name}
              </Typography>
              <Typography variant="body2" noWrap>
                @{dispName || reduceDIDstring(feedsDid)}
              </Typography>
            </Box>
            <Box>
              <StyledButton type="outlined" size='small'>Subscribe</StyledButton>
              <IconButton aria-label="settings" size='small'>
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Stack>
          <Typography variant="body2" sx={{whiteSpace: 'pre-line'}}>
            {channel.intro}
          </Typography>
        </Stack>
      </Box>
    </Card>
  );
}

export default ChannelCard;
