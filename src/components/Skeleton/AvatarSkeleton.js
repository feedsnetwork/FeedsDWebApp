import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useTheme } from '@mui/material';

// ----------------------------------------------------------------------

export default function AvatarSkeleton() {
  const theme = useTheme();
  const themeProp = {}
  if(theme.palette.mode === "dark"){
    themeProp.baseColor = '#333d48'
    themeProp.highlightColor = '#434d58'
  }
  return (
    <SkeletonTheme {...themeProp}>
      <Skeleton circle={true} style={{ justifyContent: 'center', alignItems: 'center', aspectRatio: '1/1', zIndex: 1}} />
    </SkeletonTheme>
  )
}