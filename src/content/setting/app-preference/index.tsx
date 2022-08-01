import { Box, Typography, Stack, Card, Input, Divider, IconButton, Grid, Switch, Link, styled } from '@mui/material';
import { Icon } from '@iconify/react';

import SwitchUI from 'src/components/SwitchUI'

const AppPreference = (props)=>{
  return (
    <Box p={4}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant='body1' color='text.primary'>
            Please manage your app preferences
          </Typography>
          <Grid container direction="column">
            <Grid item>
              <Stack direction='row' alignItems='center'>
                <Box flexGrow={1}>
                  <Typography variant='subtitle1'>Display Deleted Posts</Typography>
                  <Typography variant='body2' color='text.secondary'>Off</Typography>
                </Box>
                <SwitchUI/>
              </Stack>
              <Divider sx={{my: 1}}/>
            </Grid>
            <Grid item>
              <Stack direction='row' alignItems='center'>
                <Box flexGrow={1}>
                  <Typography variant='subtitle1'>Display Deleted Comments</Typography>
                  <Typography variant='body2' color='text.secondary'>On</Typography>
                </Box>
                <SwitchUI/>
              </Stack>
              <Divider sx={{my: 1}}/>
            </Grid>
          </Grid>
        </Stack>
      </Card>
    </Box>
  );
}

export default AppPreference;
