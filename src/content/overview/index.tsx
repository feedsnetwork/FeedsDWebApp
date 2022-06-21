import { Box, Container, Card } from '@mui/material';
import { Helmet } from 'react-helmet';

import { styled } from '@mui/material/styles';
import Hero from './Hero';

const OverviewWrapper = styled(Box)(
  () => `
    overflow: auto;
    flex: 1;
    overflow-x: hidden;
    align-items: center;
`
);

function Overview() {
  return (
    <OverviewWrapper>
      <Container maxWidth="lg">
        <Card sx={{ p: 5, mt: 10, borderRadius: 2 }}>
          <Hero />
        </Card>
      </Container>
    </OverviewWrapper>
  );
}

export default Overview;
