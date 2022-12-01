import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Box, Typography, Stack } from '@mui/material';

import PaperRecord from 'components/PaperRecord'
import { setVisitedChannelId } from 'redux/slices/channel';
import { getImageSource } from 'utils/common';
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
  const { name, bannerSrc=null, avatarSrc } = props;
  const background = bannerSrc ? `url(${bannerSrc}) no-repeat center` : "linear-gradient(180deg, #000000 0%, #A067FF 300.51%)"
  const avatarImg = getImageSource(avatarSrc)
  
  const handleErrorImage = (e) => {
    e.target.src = '/loading.svg'
    if(!avatarImg.startsWith("http"))
      return
    fetch(avatarImg)
      .then(res=>res.text())
      .then(res=>{e.target.src=res})
  }
  
  return (
    <Stack sx={{position: 'relative', height: '100px', mb: '25px'}}>
      <Stack sx={{height: '100%', overflow: 'hidden'}}>
        <Box className='cover-image' sx={{ display: 'inline-flex', height: '100%', background, backgroundSize: 'cover'}}/>
      </Stack>
      <AvatarBoxStyle draggable = {false} component="img" src={avatarImg} alt={name} onError={handleErrorImage}/>
    </Stack>
  );
};

const ChannelCardPaper = (props) => {
  const { channel } = props
  const { display_name, intro } = channel

  return (
      <PaperRecord>
        <Box>
          <ChannelImgBox {...channel}/>
        </Box>
        <Box sx={{px:2, pt: 1, pb: 2}}>
          <Stack direction="column" sx={{justifyContent: 'center', textAlign: 'center'}}>
            <Typography variant="h6" noWrap sx={{fontWeight: 'normal'}}>{display_name}</Typography>
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

const ChannelCard = (props) => {
  const { channel } = props
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const route2Detail = () => {
    if(!channel['channel_id'])
      return
    dispatch(setVisitedChannelId(channel['channel_id']))
    navigate('/explore/channel');
  }

  return (
    <Box onClick={route2Detail} sx={{display: 'contents', cursor: 'pointer'}}>
      <ChannelCardPaper {...props}/>
    </Box>
  );
};
export default React.memo(ChannelCard)