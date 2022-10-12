import { Box, Container, Link, Typography, styled } from '@mui/material';
import generatedGitInfo from 'generatedGitInfo.json';

function Footer() {
  return (
    <Container sx={{ position: 'absolute', bottom: 0, height: 40 }}>
      <Box>
        <Typography variant="body1">
          <strong>⚡ Powered by Elastos</strong>&nbsp;
          <Box component='img' src='elastos-white.svg' sx={{ width: '16px', verticalAlign: 'middle' }}/>&nbsp;
          v1 - {generatedGitInfo.gitCommitHash}
        </Typography>
      </Box>
    </Container>
  );
}

export default Footer;
