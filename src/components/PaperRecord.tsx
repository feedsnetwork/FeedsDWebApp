import { Paper, styled } from '@mui/material';

const paperStyle = {
  boxShadow: 'unset',
  height: '100%',
  transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  transform: 'translateY(0px)',
  '.cover-image': {
    OTransition: 'all .5s',
    transition: 'all .5s'
  },
  '&:hover': {
    boxShadow: '0 4px 8px 0px rgb(0 0 0 / 30%)',
    transform: 'translateY(-4px)'
  },
  '&:hover .cover-image': {
    OTransform: 'scale(1.2)',
    transform: 'scale(1.2)'
  },
  '&:hover .network': {
    display: 'block'
  }
}
const PaperRecord = styled(Paper)(({ theme }) => ({
  overflow: 'hidden',
  ...paperStyle
}))

export default PaperRecord;
