import { ChangeEvent, useState } from 'react';
import { Box, Stack, Grid, Radio, FormControlLabel, Typography, Card, CardHeader, Divider, lighten, CardActionArea, CardContent, Tooltip, IconButton, Avatar, styled } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StyledAvatar from 'src/components/StyledAvatar'
import StyledButton from 'src/components/StyledButton'

function PostCard() {

  const [selectedValue, setSelectedValue] = useState('a');

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
  };

  const handleDelete = () => { };

  return (
    <Card>
      {/* <CardHeader subheader='@ElastosInfo' title="Elastos" /> */}
      <Box p={3}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <StyledAvatar alt='Elastos' src='/static/images/avatars/2.jpg'/>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography component='div' variant="subtitle2" noWrap>
                Elastos Info{' '}<Typography variant="body2" sx={{display: 'inline'}}>1m</Typography>
              </Typography>
              <Typography variant="body2" noWrap>
                @ElastosInfo
              </Typography>
            </Box>
            <Box>
              <StyledButton type="outlined" size='small'>Subscribe</StyledButton>
              <IconButton aria-label="settings" size='small'>
                <MoreVertIcon />
              </IconButton>
            </Box>
          </Stack>
          <Typography variant="body2">
            Good weather today in Osaka! Hmm... where should I eat in Tennouji? Any recommendations? I’m thinking of eating raw sushi for the first time though... I hope it’s gonna be alright haha#osaka #japan #spring
          </Typography>
        </Stack>
      </Box>
    </Card>
  );
}

export default PostCard;
