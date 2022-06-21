import { Helmet } from 'react-helmet';
import Footer from 'src/components/Footer';

import { Grid, Container } from '@mui/material';

import ProfileCover from './ProfileCover';
import RecentActivity from './RecentActivity';
import Feed from './Feed';
import PopularTags from './PopularTags';
import MyCards from './MyCards';
import Addresses from './Addresses';

function ManagementUserProfile() {
  return (
    <>
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
      <Footer />
    </>
  );
}

export default ManagementUserProfile;
