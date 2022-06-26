import { useContext } from 'react';
import Scrollbar from 'src/components/Scrollbar';
import { SidebarContext } from 'src/contexts/SidebarContext';
import { Icon } from '@iconify/react';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import { Stack, Box, Drawer, alpha, styled, Divider, useTheme, Button, lighten, Card, CardHeader, CardContent, List, ListItem, ListItemText, 
  darken, Tooltip, InputAdornment, OutlinedInput, Typography, Grid } from '@mui/material';

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
  const { sidebarToggle, toggleSidebar } = useContext(SidebarContext);
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
              startAdornment={
                <InputAdornment position="start">
                  <SearchTwoToneIcon />
                </InputAdornment>
              }
            />
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
                    Array(5).fill(null).map((index)=>(
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
                            <StyledButton type="outlined">Subscribe</StyledButton>
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
          </Stack>
          {/* <Box mt={3} pb={3}>
          </Box> */}
        </Scrollbar>
      </SidebarWrapper>
    </>
  );
}

export default RightPanel;
