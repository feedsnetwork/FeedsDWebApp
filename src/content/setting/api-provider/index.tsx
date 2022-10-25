import { FC } from 'react';
import { Box, Typography, Stack, Card, Divider, List, ListItem, ListItemText } from '@mui/material';
import { Icon } from '@iconify/react';

interface ApiProviderProps {
  // type?: string;
}
const ApiProvider: FC<ApiProviderProps> = (props)=>{
  return (
    <Box p={4}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Typography variant='body1' color='text.primary'>
            Please choose your preferred API provider
          </Typography>
          <List sx={{ p: 0 }}>
            <ListItem button>
              <Stack direction='row' sx={{width: '100%', color: 'text.primary'}} alignItems='center'>
                <ListItemText 
                  primary={
                    <Typography variant='subtitle1' color='text.primary'>elastos.io</Typography>
                  }
                  secondary="Gelaxy"
                />
                <Icon icon="akar-icons:check" fontSize='20pt'/>
              </Stack>
            </ListItem>
            <Divider/>
            <ListItem button>
              <ListItemText 
                primary={
                  <Typography variant='subtitle1' color='text.primary'>trinity-tech.io</Typography>
                }
                secondary="Trinity Tech"
              />
            </ListItem>
            <Divider/>
          </List>
        </Stack>
      </Card>
    </Box>
  );
}

export default ApiProvider;
