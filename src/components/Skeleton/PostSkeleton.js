import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Box, Stack, Card, useTheme } from '@mui/material';

// ----------------------------------------------------------------------

export default function PostSkeleton() {
  const theme = useTheme();
  const themeProp = {}
  if(theme.palette.mode === "dark"){
    themeProp.baseColor = '#333d48'
    themeProp.highlightColor = '#434d58'
  }
  return (
    <Card>
      <SkeletonTheme {...themeProp}>
        <Box p={3}>
          <Stack direction="row" spacing={1}>
            <Skeleton width={50} height={50} circle={true}/>
            <Box sx={{flexGrow: 1, lineHeight: '1.5rem', justifyContent: 'center', display: 'flex', flexDirection: 'column', '& h5': {margin: 0, width: '100%'}}}>
              <h5><Skeleton/></h5>
              <h5><Skeleton/></h5>
            </Box>
          </Stack>
          <h5 style={{margin: '1em 0 0'}}>
            <Skeleton count={3}/>
          </h5>
        </Box>
      </SkeletonTheme>
    </Card>
  )
}