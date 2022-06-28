import { useContext } from 'react';
import { Icon } from '@iconify/react';
import { Grid, Container, Box, Typography, Stack, styled, TextField, IconButton } from '@mui/material';

import PostCard from 'src/components/PostCard';
import EmptyView from 'src/components/EmptyView'
import { SidebarContext } from 'src/contexts/SidebarContext';
import StyledButton from 'src/components/StyledButton';

const PostBoxStyle = styled(Box)(({ theme }) => ({
  position: 'sticky',
  bottom: 0,
  zIndex: 1,
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  background: 'rgba(22, 28, 36, 0.8)',
  backdropFilter: 'blur(20px)',
}));

const StyledIconButton = ({icon}) => 
  <IconButton sx={{
    '& .iconify>path[fill=currentColor]': {
      fill: 'unset'
    }
  }}>
    <svg width={0} height={0}>
      <linearGradient id="linearColors" x1={0} y1={1} x2={1} y2={1}>
        <stop offset={0} stopColor="#7624FE" />
        <stop offset={1} stopColor="#368BFF" />
      </linearGradient>
    </svg>
    <Icon icon={icon} style={{ fill: 'url(#linearColors)' }}/>
  </IconButton>


const GradientOutlineTextField = styled(TextField)(
  ({ theme }) => `
    &:before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 16px; 
      padding: 1px; 
      background: linear-gradient(90deg, #7624FE 0%, #368BFF 100%);
      -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
              mask-composite: exclude; 
    }
    & .MuiOutlinedInput-notchedOutline {
      border-width: 0px;
    }
    background: transparent;
`
);

function Channel() {
  const { focusedChannel } = useContext(SidebarContext);

  const isEmpty = focusedChannel?false:true
  return (
    <>
      {
        isEmpty?
        <EmptyView type='channel'/>:

        <>
          <Container sx={{ mt: 3 }} maxWidth="lg">
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="stretch"
              spacing={3}
            >
              {
                Array(5).fill(null).map((_, index)=>(
                  <Grid item xs={12} key={index}>
                    <PostCard />
                  </Grid>
                ))
              }
            </Grid>
          </Container>
          <PostBoxStyle>
            <Stack spacing={2}>
              <GradientOutlineTextField
                multiline
                rows={3}
                placeholder="What's up"
              />
              <Stack direction='row'>
                <Box sx={{ alignItems: 'center', display: 'flex', flexGrow: 1 }}>
                  <StyledIconButton icon="clarity:picture-line"/>
                  <StyledIconButton icon="clarity:camera-line"/>
                  <StyledIconButton icon="clarity:video-gallery-line"/>
                  <StyledIconButton icon="clarity:video-camera-line"/>
                  <IconButton>
                    <Typography variant='body2' sx={{
                      backgroundImage: 'linear-gradient(90deg, #7624FE 0%, #368BFF 100%)',
                      backgroundSize: '100%',
                      backgroundRepeat: 'repeat',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      MozBackgroundClip: 'text',
                      MozTextFillColor: 'transparent',
                    }}>
                      NFT
                    </Typography>
                  </IconButton>
                </Box>
                <Box width={150}>
                  <StyledButton fullWidth>Post</StyledButton>
                </Box>
              </Stack>
            </Stack>
          </PostBoxStyle>
        </>
      }
    </>
  );
}

export default Channel;
