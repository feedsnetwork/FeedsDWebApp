import React from 'react'
import { Grid, Container, Box, Typography, Stack } from '@mui/material';

import ChannelCard from 'src/components/ChannelCard';
import { EmptyView } from 'src/components/EmptyView'
import { SidebarContext } from 'src/contexts/SidebarContext';

function Explorer() {
  const { selfChannels } = React.useContext(SidebarContext);
  return (
    <>
      {
        !selfChannels.length?
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
              selfChannels.map((channel, _i)=>(
                <Grid item xs={12} key={_i}>
                  <ChannelCard channel={channel}/>
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
