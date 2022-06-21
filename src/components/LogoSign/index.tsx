import {
  Box,
  Tooltip,
  Badge,
  TooltipProps,
  tooltipClasses,
  styled,
  useTheme
} from '@mui/material';
import { Link } from 'react-router-dom';

const LogoWrapper = styled(Link)(
  ({ theme }) => `
        color: ${theme.palette.text.primary};
        display: flex;
        text-decoration: none;
        width: 53px;
        margin: 0 auto;
        font-weight: ${theme.typography.fontWeightBold};
`
);


function Logo(props) {
  const { width='auto' } = props
  const theme = useTheme();

  return (
      <Link to="/home">
        <Box component='img' src='/feeds-logo.svg' width={width}/>
      </Link>
  );
}

export default Logo;
