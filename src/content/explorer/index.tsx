import Footer from 'src/components/Footer';
import { Grid, Container, Box, Typography, Stack } from '@mui/material';

import MyCards from './MyCards';
import EmptyView from 'src/components/EmptyView'

function Explorer() {
  const isEmpty = false
  return (
    <>
      {
        isEmpty?
        <EmptyView/>:

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
    </>
  );
}

export default Explorer;
