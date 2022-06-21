import { Box, Button, Container, Grid, Typography } from '@mui/material';

import { Link as RouterLink } from 'react-router-dom';

import { styled } from '@mui/material/styles';

import Logo from 'src/components/LogoSign';

function Hero() {
  return (
    <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
      <Grid
        spacing={{ xs: 6, md: 10 }}
        justifyContent="center"
        alignItems="center"
        container
      >
        <Grid item md={10} lg={8} mx="auto">
          <Box display="flex" justifyContent="center" alignItems="center" mb={3}>
            <Logo width={150}/>
          </Box>
          <Typography variant='h3' sx={{ mb: 2 }}>
            Hello! 👋<br/>Welcome to Feeds Network!
          </Typography>
          <Button
            component={RouterLink}
            to="/home"
            size="large"
            variant="contained"
          >
            Preview
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Hero;
