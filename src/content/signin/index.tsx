import React from 'react'
import { Box, Container, Card } from '@mui/material';
import { styled } from '@mui/material/styles';

import Hero from './Hero';

const OverviewWrapper = styled(Box)(
  () => `
    overflow: auto;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  `
);

function SignIn() {
  return (
    <OverviewWrapper p={3}>
      <Card sx={{ p: {xs: 4, sm: 5, md: 7, lg: 8}, borderRadius: 3, display: 'inline-flex' }}>
        <Hero />
      </Card>
    </OverviewWrapper>
  );
}

export default SignIn;
