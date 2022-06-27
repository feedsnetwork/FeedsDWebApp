import { useContext } from 'react';
import Footer from 'src/components/Footer';
import { Grid, Container, Box, Typography, Stack } from '@mui/material';

import PostCard from 'src/components/PostCard';
import EmptyView from 'src/components/EmptyView'
import { SidebarContext } from 'src/contexts/SidebarContext';

function Channel() {
  const { focusedChannel } = useContext(SidebarContext);

  const isEmpty = focusedChannel?false:true
  return (
    <>
      {
        isEmpty?
        <EmptyView type='channel'/>:

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

export default Channel;
