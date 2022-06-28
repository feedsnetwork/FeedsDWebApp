import { useContext } from 'react';
import Scrollbar from 'src/components/Scrollbar';
import { SidebarContext } from 'src/contexts/SidebarContext';
import { Icon } from '@iconify/react';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import ShareIcon from '@mui/icons-material/ShareOutlined';
import { Stack, Box, Drawer, alpha, styled, Divider, useTheme, Button, lighten, Card, CardHeader, CardContent, List, ListItem, ListItemText, 
  darken, Tooltip, InputAdornment, OutlinedInput, Typography, Grid, IconButton } from '@mui/material';

import StyledAvatar from 'src/components/StyledAvatar'
import StyledButton from 'src/components/StyledButton'

const SidebarWrapper = styled(Box)(
  ({ theme }) => `
        width: ${theme.rightPanel.width};
        min-width: ${theme.rightPanel.width};
        color: ${theme.colors.alpha.trueWhite[70]};
        position: relative;
        z-index: 7;
        height: 100%;
`
);
const OutlinedInputWrapper = styled(OutlinedInput)(
  ({ theme }) => `
    background-color: ${theme.colors.alpha.white[100]};
    padding-right: ${theme.spacing(0.7)}
`
);
const ListWrapper = styled(List)(
  () => `
      .MuiListItem-root {
        border-radius: 0;
        margin: 0;
      }
`
);
function RightPanel() {
  const { sidebarToggle, focusedChannel, toggleSidebar } = useContext(SidebarContext);

  const closeSidebar = () => toggleSidebar();
  const theme = useTheme();

  return (
    <>
      <SidebarWrapper
        sx={{
          display: {
            xs: 'none',
            lg: 'inline-block'
          },
          boxShadow:
            theme.palette.mode === 'dark' ? theme.sidebar.boxShadow : 'none'
        }}
      >
        <Scrollbar>
          <Stack spacing={3} my={3} px={2}>
            <OutlinedInputWrapper
              type="text"
              placeholder="Search"
              size="small"
              startAdornment={
                <InputAdornment position="start">
                  <SearchTwoToneIcon />
                </InputAdornment>
              }
            />
            {
              focusedChannel?
              <>
                <Card>
                  <CardContent>
                    <Stack alignItems='end'>
                      <Stack direction='row' spacing={1}>
                        <Box m='auto'>
                          <IconButton sx={{borderRadius: '50%', backgroundColor: (theme)=>theme.colors.primary.main}} size='small'><ShareIcon fontSize='small'/></IconButton>
                        </Box>
                        <StyledButton type='outlined' size='small'>Edit channel</StyledButton>
                      </Stack>
                    </Stack>
                    <Stack alignItems='center' my={2}>
                      <StyledAvatar alt={focusedChannel.name} src='/channel.png' width={60}/>
                      <Typography variant='h5' mt={1}>{focusedChannel.name}</Typography>
                      <Typography variant='body2'>@asralf</Typography>
                      <Typography variant='body2' color='text.secondary' textAlign='center'>Hello! Welcome to my main channel! I love Elastos. Subscribe to my channel to get the latest info!</Typography>
                    </Stack>
                    <Stack alignItems='center'>
                      <Stack direction='row' spacing={1}>
                        <Typography variant='subtitle2' sx={{display: 'flex', alignItems: 'center'}}><Icon icon="clarity:group-line" fontSize='20px' />&nbsp;100 Subscribers</Typography>
                        <StyledButton size='small'>Subscribed</StyledButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader 
                    title={
                      <Typography variant='h5' sx={{ display: 'flex', alignItems: 'center' }}>Subscribers</Typography>
                    } 
                    subheader={
                      <Typography variant='body2' color='text.secondary'>100 Subscribers</Typography>
                    }
                  />
                  <CardContent sx={{pt: 0}}>
                    <Grid container spacing={2}>
                      {
                        Array(5).fill(null).map((_, index)=>(
                          <Grid item xs={12} key={index}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <StyledAvatar alt='Elastos' src='/static/images/avatars/2.jpg' width={32}/>
                              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                <Typography component='div' variant="subtitle2" noWrap>
                                  Phantz Club
                                </Typography>
                                <Typography variant="body2" color='text.secondary' noWrap>
                                  100 Subscribers
                                </Typography>
                              </Box>
                              <Box>
                                <StyledButton type="outlined" size='small'>Subscribe</StyledButton>
                              </Box>
                            </Stack>
                          </Grid>
                        ))
                      }
                      <Grid item xs={12} textAlign='center'>
                        <Button color="inherit">
                          Show more
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </>:

              <>
                <Card>
                  <CardHeader 
                    title={
                      <Typography variant='h5'>Trends</Typography>
                    } 
                  />
                  <CardContent sx={{pt: 0}}>
                    <ListWrapper disablePadding>
                      <ListItem
                        button
                      >
                        <ListItemText 
                          primary={
                            <Typography variant='subtitle2' color='text.primary'>#web5</Typography>
                          }
                          secondary="100 post"
                        />
                      </ListItem>
                      <ListItem
                        button
                      >
                        <ListItemText 
                          primary={
                            <Typography variant='subtitle2' color='text.primary'>#web5</Typography>
                          }
                          secondary="100 post"
                        />
                      </ListItem>
                    </ListWrapper>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader 
                    title={
                      <Typography variant='h5' sx={{ display: 'flex', alignItems: 'center' }}>Collection Channels&nbsp;<Icon icon="eva:info-outline"/></Typography>
                    } 
                    subheader={
                      <Typography variant='body2' color='text.secondary'>Powered by Pasar Protocol</Typography>
                    }
                  />
                  <CardContent sx={{pt: 0}}>
                    <Grid container spacing={2}>
                      {
                        Array(5).fill(null).map((_, index)=>(
                          <Grid item xs={12} key={index}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <StyledAvatar alt='Elastos' src='/static/images/avatars/2.jpg' width={32}/>
                              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                <Typography component='div' variant="subtitle2" noWrap>
                                  Phantz Club
                                </Typography>
                                <Typography variant="body2" color='text.secondary' noWrap>
                                  100 Subscribers
                                </Typography>
                              </Box>
                              <Box>
                                <StyledButton type="outlined" size='small'>Subscribe</StyledButton>
                              </Box>
                            </Stack>
                          </Grid>
                        ))
                      }
                      <Grid item xs={12} textAlign='center'>
                        <Button color="inherit">
                          Show more
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </>
            }
          </Stack>
          {/* <Box mt={3} pb={3}>
          </Box> */}
        </Scrollbar>
      </SidebarWrapper>
    </>
  );
}

export default RightPanel;
