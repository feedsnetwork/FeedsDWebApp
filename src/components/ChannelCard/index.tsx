import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { alpha, styled } from '@mui/material/styles';
import { Box, Typography, Stack, Paper } from '@mui/material';

// ----------------------------------------------------------------------
const paperStyle = {
  boxShadow: 'unset',
  height: '100%',
  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  transform: 'translateY(0px)',
  '.cover-image': {
    OTransition: 'all .5s',
    transition: 'all .5s'
  },
  '&:hover': {
    boxShadow: '0 4px 8px 0px rgb(0 0 0 / 30%)',
    transform: 'translateY(-4px)'
  },
  '&:hover .cover-image': {
    OTransform: 'scale(1.2)',
    transform: 'scale(1.2)'
  },
  '&:hover .network': {
    display: 'block'
  }
}
const forceHoverStyle = {
  boxShadow: '0 4px 8px 0px rgb(0 0 0 / 30%)',
  transform: 'translateY(-4px)',
  '& .cover-image': {
    OTransform: 'scale(1.2)',
    transform: 'scale(1.2)'
  },
}
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

const PaperRecord = (props)=>(
  <Paper
      sx={{
          border: '1px solid',
          borderColor: 'action.disabledBackground',
          ...props.sx
      }}
      onClick={props.onClick}
  >
      {props.children}
  </Paper>
)

const ChannelImgBox = (props) => {
  const { name, bannerImg=null, avatarImg } = props;
  const background = bannerImg ? `url(${bannerImg}) no-repeat center` : "linear-gradient(180deg, #000000 0%, #A067FF 300.51%)"
  return (
    <Stack sx={{position: 'relative', height: '100px', mb: '25px'}}>
      <Stack sx={{height: '100%', overflow: 'hidden'}}>
        <Box className='cover-image' sx={{ display: 'inline-flex', height: '100%', background, backgroundSize: 'cover'}}/>
      </Stack>
      <AvatarBoxStyle draggable = {false} component="img" src={avatarImg}/>
    </Stack>
  );
};

const ChannelCardPaper = (props) => {
  const { info } = props
  const { name, intro } = info

  return (
      <PaperRecord sx={{ overflow: 'hidden', ...paperStyle }}>
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
              {intro}
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