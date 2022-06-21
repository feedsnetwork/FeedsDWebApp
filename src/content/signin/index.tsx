import { Box, Container, Card } from '@mui/material';
import { Helmet } from 'react-helmet';

import { styled } from '@mui/material/styles';
import Hero from './Hero';

const OverviewWrapper = styled(Box)(
  () => `
    overflow: auto;
    flex: 1;
    overflow-x: hidden;
    text-align: center;
`
);

function SignIn() {
  return (
    <OverviewWrapper p={3}>
      <Card sx={{ p: {xs: 2, sm: 3, md: 5, lg: 8}, mt: 10, borderRadius: 3, display: 'inline-flex' }}>
        <Hero />
      </Card>
    </OverviewWrapper>
  );
}

export default SignIn;
