import { FC, useContext } from 'react';
import { Box, Typography, Stack, Card, Link, Divider, IconButton, Grid, List, ListItem, ListItemText, styled } from '@mui/material';
import { Icon } from '@iconify/react';

interface LanguageProps {
  // type?: string;
}
const Language: FC<LanguageProps> = (props)=>{
  return (
    <Box p={4}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Typography variant='body1' color='text.primary'>
            Please choose your prefered language
          </Typography>
          <List sx={{ p: 0 }}>
            <ListItem button>
              <Stack direction='row' sx={{width: '100%', color: 'text.primary'}} alignItems='center'>
                <ListItemText 
                  primary={
                    <Typography variant='subtitle1' color='text.primary'>English</Typography>
                  }
                  secondary="English"
                />
                <Icon icon="akar-icons:check" fontSize='20pt'/>
              </Stack>
            </ListItem>
            <Divider/>
            <ListItem button>
              <ListItemText 
                primary={
                  <Typography variant='subtitle1' color='text.primary' sx={{ fontFamily: 'Montserrat' }}>中文 (简体)</Typography>
                }
                secondary="Chinese (simplified)"
              />
            </ListItem>
            <Divider/>
            <Link href='#' sx={{display: 'flex', alignItems: 'center', color: 'text.primary', mt: .5}}>
              <Typography variant="body2" sx={{color: 'origin.main'}}>
                Can’t find you language? Help us by translating here
              </Typography>&nbsp;
              <Icon icon='line-md:external-link' width="18px"/>
            </Link>
          </List>
        </Stack>
      </Card>
    </Box>
  );
}

export default Language;
