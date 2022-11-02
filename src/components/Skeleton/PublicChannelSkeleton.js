import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Box, Stack, useTheme } from '@mui/material';

// ----------------------------------------------------------------------

export default function PublicChannelSkeleton() {
  const theme = useTheme();
  const themeProp = {}
  if(theme.palette.mode === "dark"){
    themeProp.baseColor = '#333d48'
    themeProp.highlightColor = '#434d58'
  }
  return (
    <SkeletonTheme {...themeProp}>
      <Box>
        <Stack direction="row" spacing={1}>
          <Skeleton width={40} height={40} circle={true}/>
          <Box sx={{flexGrow: 1, lineHeight: '1.4rem', justifyContent: 'center', display: 'flex', flexDirection: 'column', '& h5': {margin: 0, width: '100%'}}}>
            <h5><Skeleton/></h5>
            <h5><Skeleton/></h5>
          </Box>
        </Stack>
      </Box>
    </SkeletonTheme>
  )
}