import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { alpha, styled } from '@mui/material/styles';
import { Box, Typography, Stack, Paper } from '@mui/material';

import PaperRecord from 'src/components/PaperRecord'
// ----------------------------------------------------------------------

const TypographyStyle = styled(Typography)(({ theme }) => ({
  fontWeight: 'normal',
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word'
}));
const AvatarBoxStyle = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: '50%',
  backgroundColor: 'black',
  display: 'flex',
  position: 'absolute',
  left:0,
  right: 0,
  bottom: -24,
  margin: 'auto',
})) as any;

const ChannelImgBox = (props) => {
  const { name, data } = props;
  const { bannerUrl=null, avatarUrl } = data
  const background = bannerUrl ? `url(${bannerUrl}) no-repeat center` : "linear-gradient(180deg, #000000 0%, #A067FF 300.51%)"
  return (
    <Stack sx={{position: 'relative', height: '100px', mb: '25px'}}>
      <Stack sx={{height: '100%', overflow: 'hidden'}}>
        <Box className='cover-image' sx={{ display: 'inline-flex', height: '100%', background, backgroundSize: 'cover'}}/>
      </Stack>
      <AvatarBoxStyle draggable = {false} component="img" src={avatarUrl} alt={name}/>
    </Stack>
  );
};

const ChannelCardPaper = (props) => {
  const { info } = props
  const { name, description } = info

  return (
      <PaperRecord>
        <Box>
          <ChannelImgBox {...info}/>
        </Box>
        <Box sx={{px:2, pt: 1, pb: 2}}>
          <Stack direction="column" sx={{justifyContent: 'center', textAlign: 'center'}}>
            <Typography variant="h6" noWrap sx={{fontWeight: 'normal'}}>{name}</Typography>
            <TypographyStyle 
              variant="subtitle2"
              color='text.secondary'
              sx={{ 
                lineHeight: 1.3,
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                whiteSpace: 'normal',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                display: '-webkit-box !important'
              }}
            >
              {description}
            </TypographyStyle>
          </Stack>
        </Box>
      </PaperRecord>
  );
};

export default function ChannelCard(props) {
  const navigate = useNavigate();
  const route2Detail = () => {
    
  }

  return (
    <Box onClick={route2Detail} sx={{display: 'contents', cursor: 'pointer'}}>
      <ChannelCardPaper {...props}/>
    </Box>
  );
};