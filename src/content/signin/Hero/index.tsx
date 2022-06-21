import { Box, Button, Container, Grid, Typography, Link } from '@mui/material';

import { Link as RouterLink } from 'react-router-dom';

import { styled } from '@mui/material/styles';

import Logo from 'src/components/LogoSign';
import StyledButton from 'src/components/StyledButton';

function Hero() {
  return (
    <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
      <Box display="flex" justifyContent="center" alignItems="center" mb={3}>
        <Logo width={120}/>
      </Box>
      <Typography variant='h3' sx={{ my: 7 }}>
        Hello! 👋<br/>Welcome to Feeds Network!
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <StyledButton component={RouterLink} to="/home" fullWidth>Sign in with DID</StyledButton>
        </Grid>
        <Grid item xs={12}>
          <StyledButton type="outline" fullWidth>I don’t have a DID</StyledButton>
        </Grid>
        <Grid item xs={12}>
          <Link href="https://www.elastos.org/did" underline="hover" color='inherit' target="_blank">
            What is a DID?
          </Link>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Hero;
