import { Box, Container, Typography, styled } from '@mui/material';
import generatedGitInfo from 'generatedGitInfo.json';

const FooterWrapper = styled(Container)(
  ({ theme }) => `
        margin-top: ${theme.spacing(4)};
`
);

function Footer() {
  return (
    <FooterWrapper className="footer-wrapper">
      <Box
        pb={4}
        display={{ xs: 'block', md: 'flex' }}
        alignItems="center"
        textAlign={{ xs: 'center', md: 'left' }}
        justifyContent="space-between"
      >
        <Box>
          <Typography variant="body1">
            <strong>⚡ Powered by Elastos</strong> v1 - {generatedGitInfo.gitCommitHash}
          </Typography>
        </Box>
      </Box>
    </FooterWrapper>
  );
}

export default Footer;
