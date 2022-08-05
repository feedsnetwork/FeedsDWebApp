import { Grid, Container, Box, Typography, Stack } from '@mui/material';

import PostCard from 'src/components/PostCard';
import { EmptyView } from 'src/components/EmptyView'

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
            {
              Array(5).fill(null).map((_, index)=>(
                <Grid item xs={12} key={index}>
                  <PostCard />
                </Grid>
              ))
            }
          </Grid>
        </Container>
      }
    </>
  );
}

export default Explorer;
