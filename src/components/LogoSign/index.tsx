import { Box } from '@mui/material';
import { Link } from 'react-router-dom';

function Logo(props) {
  const { width='auto' } = props

  return (
      <Link to="/home">
        <Box component='img' src='/feeds-logo.svg' width={width}/>
      </Link>
  );
}

export default Logo;
