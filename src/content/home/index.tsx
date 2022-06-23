import { Helmet } from 'react-helmet';
import Footer from 'src/components/Footer';
import { Grid, Container, Box, Typography, Stack } from '@mui/material';

import MyCards from './MyCards';
import StyledButton from 'src/components/StyledButton';

function Home() {
  const isEmpty = true
  return (
    <>
      {
        isEmpty?
        <Stack alignItems='center'>
          <Box component='img' src='post-chat.svg' width={{xs: 80, md: 100, lg: 120}} pt={{xs: 5, sm: 6, md: 10, lg: 12}} pb={{xs: 3, sm: 4, md: 6, lg: 8}}/>
          <Typography variant='h4' align='center'>
            Your timeline is empty
          </Typography>
          <Stack spacing={4}>
            <Typography variant='body2' sx={{opacity: .8}} align='center'>
              Add new channel or find new<br/>channels to subscribe!
            </Typography>
            <StyledButton type="outline" fullWidth>Add Channel</StyledButton>
            <StyledButton type="outline" fullWidth>Explore Feeds</StyledButton>
          </Stack>
        </Stack>:

        <Container sx={{ mt: 3 }} maxWidth="lg">
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="stretch"
            spacing={3}
          >
            <Grid item xs={12}>
              <MyCards />
            </Grid>
            <Grid item xs={12}>
              <MyCards />
            </Grid>
            <Grid item xs={12}>
              <MyCards />
            </Grid>
            <Grid item xs={12}>
              <MyCards />
            </Grid>
            <Grid item xs={12}>
              <MyCards />
            </Grid>
          </Grid>
        </Container>
      }
      {/* <Footer /> */}
    </>
  );
}

export default Home;
