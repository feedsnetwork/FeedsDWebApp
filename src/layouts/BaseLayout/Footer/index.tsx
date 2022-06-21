import { Box, Container, Link, Typography, styled } from '@mui/material';

function Footer() {
  return (
    <Container sx={{ position: 'absolute', bottom: 0, height: 40 }}>
      <Box>
        <Typography variant="subtitle1">
          ⚡ Powered by Elastos{' '}
          <Box component='img' src='elastos-white.svg' sx={{ width: '16px', verticalAlign: 'middle' }}/>
        </Typography>
      </Box>
    </Container>
  );
}

export default Footer;
