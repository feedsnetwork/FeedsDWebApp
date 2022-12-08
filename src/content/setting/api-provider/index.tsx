import { FC, useState } from 'react';
import { Box, Typography, Stack, Card, Divider, List, ListItem, ListItemText } from '@mui/material';
import { Icon } from '@iconify/react';

interface ApiProviderProps {
  // type?: string;
}
const ApiTyps = [
  {api: 'elastos.io', description: 'Gelaxy'},
  {api: 'trinity-tech.io', description: 'Trinity Tech'}
]
const ApiProvider: FC<ApiProviderProps> = ()=>{
  const Api = parseInt(localStorage.getItem('FEEDS_API') || '1')
  const [apiType, setApiType] = useState(Api)

  const handleApi = (index)=>{
    setApiType(index)
    localStorage.setItem('FEEDS_API', index)
  }
  return (
    <Box p={4}>
      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Typography variant='body1' color='text.primary'>
            Please choose your preferred API provider
          </Typography>
          <List sx={{ p: 0 }}>
            {
              ApiTyps.map((type, _i)=>{
                return <>
                  <ListItem button onClick={()=>handleApi(_i)}>
                    <Stack direction='row' sx={{width: '100%', color: 'text.primary'}} alignItems='center'>
                      <ListItemText 
                        primary={
                          <Typography variant='subtitle1' color='text.primary'>{type.api}</Typography>
                        }
                        secondary={type.description}
                      />
                      {
                        apiType===_i &&
                        <Icon icon="akar-icons:check" fontSize='20pt'/>
                      }
                    </Stack>
                  </ListItem>
                  <Divider/>
                </>
              })
            }
          </List>
        </Stack>
      </Card>
    </Box>
  );
}

export default ApiProvider;
