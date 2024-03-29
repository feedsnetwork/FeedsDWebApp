import React from 'react'
import { Box, Typography, Stack, Card, Divider, Grid } from '@mui/material';

import SwitchUI from 'components/SwitchUI'
import { getAppPreference } from 'utils/common'

const AppPreference = (props)=>{
  const initConf = getAppPreference()
  const [preference, setPreference] = React.useState(initConf)

  const onChangeMode = (event) => {
    const tempVal = event.target.value
    const tempValSplit = tempVal.split('_')
    const tempPreference = {...preference}
    tempPreference[tempValSplit[0]] = tempValSplit[1]*1
    setPreference(tempPreference)
    localStorage.setItem('FEEDS_PREF', JSON.stringify(tempPreference))
  };

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
                  <Typography variant='body2' color='text.secondary'>{preference.DP?'On':'Off'}</Typography>
                </Box>
                <SwitchUI
                  value={!preference.DP?'DP_1':'DP_0'}
                  onChange={onChangeMode}
                  checked={!!preference.DP}
                />
              </Stack>
              <Divider sx={{my: 1}}/>
            </Grid>
            <Grid item>
              <Stack direction='row' alignItems='center'>
                <Box flexGrow={1}>
                  <Typography variant='subtitle1'>Display Deleted Comments</Typography>
                  <Typography variant='body2' color='text.secondary'>{preference.DC?'On':'Off'}</Typography>
                </Box>
                <SwitchUI
                  value={!preference.DC?'DC_1':'DC_0'}
                  onChange={onChangeMode}
                  checked={!!preference.DC}
                />
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
