import { Helmet } from 'react-helmet';
import Footer from 'src/components/Footer';
import { Grid, Container, Box, Typography, Stack } from '@mui/material';

import EmptyView from 'src/components/EmptyView'

function Channel() {
  const isEmpty = true
  return (
    <>
      {
        isEmpty?
        <EmptyView type='channel'/>:

        <Container sx={{ mt: 3 }} maxWidth="lg">
          
        </Container>
      }
      {/* <Footer /> */}
    </>
  );
}

export default Channel;
