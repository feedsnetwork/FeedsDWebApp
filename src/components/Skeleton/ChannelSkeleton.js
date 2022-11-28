import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { Box, Stack, Card, useTheme } from '@mui/material';

// ----------------------------------------------------------------------

export default function ChannelSkeleton() {
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
          <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
            <Skeleton width={50} height={50} circle={true}/>
            <h5 style={{flexGrow: 1, lineHeight: 1.8}}>
              <Skeleton count={3}/>
            </h5>
          </Stack>
        </Box>
      </SkeletonTheme>
    </Card>
  )
}