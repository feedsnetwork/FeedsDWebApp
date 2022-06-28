import { useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import FadeIn from 'react-fade-in';
import { Icon } from '@iconify/react';
import { Stack, Box, Button, Hidden, ListItemText, Typography, styled, alpha, lighten } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';

import StyledAvatar from 'src/components/StyledAvatar'
import StyledButton from 'src/components/StyledButton'
import Scrollbar from 'src/components/Scrollbar';
import { SidebarContext } from 'src/contexts/SidebarContext';
import { OverPageContext } from 'src/contexts/OverPageContext';

const HeaderWrapper = styled(Box)(
  ({ theme }) => `
        height: ${theme.header.height};
        color: ${theme.header.textColor};
        padding: ${theme.spacing(0, 2)};
        right: ${theme.rightPanel.width};
        z-index: 6;
        background-color: ${alpha(theme.header.background, 0.95)};
        backdrop-filter: blur(3px);
        position: fixed;
        justify-content: space-between;
        width: 100%;
        display: flex;
        align-items: center;
        @media (min-width: ${theme.breakpoints.values.lg}px) {
            // margin-left: calc(${theme.sidebarChannel.width} + ${theme.sidebar.width});
            // margin-right: ${theme.rightPanel.width};
            left: calc(${theme.sidebarChannel.width} + ${theme.sidebar.width});
            width: auto;
        }
        box-shadow: ${
          theme.palette.mode === 'dark'
            ? `0 1px 0 ${alpha(
                lighten(theme.colors.primary.main, 0.7),
                0.15
              )}, 0px 2px 8px -3px rgba(0, 0, 0, 0.2), 0px 5px 22px -4px rgba(0, 0, 0, .1)`
            : `0px 2px 8px -3px ${alpha(
                theme.colors.alpha.black[100],
                0.2
              )}, 0px 5px 22px -4px ${alpha(
                theme.colors.alpha.black[100],
                0.1
              )}`
        };
`
);

function FloatingHeader() {
  const { pageType, setPageType, closeOverPage } = useContext(OverPageContext);
  const { focusedChannel } = useContext(SidebarContext);
  const { pathname } = useLocation()

  const handleClose = (e) => {
    if(pageType === 'AddChannel'){
      if(focusedChannel)
        setPageType('CurrentChannel')
      else
        closeOverPage()
    }
  }
  let actionText;
  if(pageType==='AddChannel')
    actionText = 'Add Channel'
  else if(pathname.startsWith('/setting'))
    actionText = 
      <ListItemText 
        primary={
          <Typography variant='subtitle2' color='text.primary' textAlign='left'>Settings</Typography>
        }
        secondary="Profile and verifiable credentials (DID) details"
      />
  else if(pageType==='CurrentChannel')
    actionText = focusedChannel?
      <ListItemText 
        primary={
          <Typography variant='subtitle2' color='text.primary' textAlign='left'>{focusedChannel.name}</Typography>
        }
        secondary="3 post"
      />:
      ''
  else actionText=''
  return (
    <>
      <Hidden lgDown>
        <Box sx={{pb: (theme)=>`${theme.header.height}`}}>
          <HeaderWrapper>
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
            >
              {
                !!actionText&&
                <Button
                  color="inherit"
                  startIcon={<ArrowBack />}
                  onClick={handleClose}
                >
                  {actionText}
                </Button>
              }
            </Stack>
          </HeaderWrapper>
        </Box>
      </Hidden>
    </>
  );
}

export default FloatingHeader;
