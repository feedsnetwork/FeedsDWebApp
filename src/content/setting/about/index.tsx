import { Box, Typography, Stack, Card, Divider, Grid } from '@mui/material';
import generatedGitInfo from 'generatedGitInfo.json';

const aboutData = [
  {title: 'Website', value: 'https://feedsnetwork.io'},
  {title: 'Email', value: 'feeds@trinity-tech.io'},
  {title: 'Telegram', value: 'https://t.me/feedscapsule'},
  {title: 'Disclaimer', value: 'https://trinity-feeds.app/disclaimer'},
  {title: 'Version', value: 'v3.0.1'},
  {title: 'Commit ID', value: generatedGitInfo.gitCommitHash},
]
const About = (props)=>{
  return (
    <Box p={4}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={6} alignItems='center'>
          <Box component="img" alt='feeds' src='/feeds-logo.svg' width={{sx: 70, md: 100}}/>
          <Grid container direction="column">
            {
              aboutData.map((item, _i)=>(
                <Grid item key={_i} pt={_i?2:0}>
                  <Typography variant='subtitle1'>{item.title}</Typography>
                  <Typography variant='body2' color='text.secondary'>{item.value}</Typography>
                  <Divider/>
                </Grid>
              ))
            }
          </Grid>
        </Stack>
      </Card>
    </Box>
  );
}

export default About;
