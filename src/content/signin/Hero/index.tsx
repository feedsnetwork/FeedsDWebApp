
import React from 'react'
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Grid, Typography, Link, Stack, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

import Logo from 'src/components/LogoSign';
import StyledButton from 'src/components/StyledButton';

const LinearProgressWrapper = styled(LinearProgress)(
  ({ theme }) => `
      flex-grow: 1;
      height: 15px;
      margin: ${theme.spacing(1, 0, 2)};
      
      &.MuiLinearProgress-root {
        background-color: ${theme.colors.alpha.black[10]};
      }
      
      .MuiLinearProgress-bar {
        border-radius: ${theme.general.borderRadiusXl};
      }
`
);

function Hero() {
  const [verifyState, setVerifyState] = React.useState(0)
  return (
    <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
      <Box display="flex" justifyContent="center" alignItems="center">
        <Link to="/home" component={RouterLink}>
          <Box component='img' src='/feeds-logo.svg' sx={{width: {xs: 80, md: 100, lg: 120}}}/>
        </Link>
      </Box>
      {
        verifyState===0 && <>
          <Typography variant='h3' sx={{ my: {xs: 3, sm: 5, md: 7} }}>
            Hello! 👋<br/>Welcome to Feeds Network!
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              {/* <StyledButton component={RouterLink} to="/home" fullWidth>Sign in with DID</StyledButton> */}
              <StyledButton fullWidth onClick={(e)=>{setVerifyState(1)}}>Sign in with DID</StyledButton>
            </Grid>
            <Grid item xs={12}>
              <StyledButton type="outline" fullWidth>I don’t have a DID</StyledButton>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='caption'>
                <Link href="https://www.elastos.org/did" underline="always" color='inherit' target="_blank">
                  What is a DID?
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </>
      }
      {
        verifyState===1 && <>
          <Stack spacing={2} sx={{ mt: {xs: 3, sm: 5, md: 7} }} alignItems='center'>
            <Typography variant='h3' component='div'>
              Authorization
            </Typography>
            <Typography variant='body2' sx={{opacity: .8}}>
              Connecting to Hive node...
            </Typography>
            <Box component='img' src='hive.svg' width={{xs: 80, md: 100, lg: 120}} py={1} draggable={false}/>
            <Box width='100%'>
              <LinearProgressWrapper
                value={25}
                color="primary"
                variant="determinate"
                sx={{
                  '.MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, #7624FE ${100 - 25}%, #368BFF 100%);`
                  }
                }}
              />
            </Box>
          </Stack>
        </>
      }
    </Container>
  );
}

export default Hero;
