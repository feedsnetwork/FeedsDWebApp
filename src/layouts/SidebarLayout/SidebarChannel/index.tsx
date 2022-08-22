import { useState, useContext, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { Icon } from '@iconify/react';
import AddIcon from '@mui/icons-material/Add';
import ShareIcon from '@mui/icons-material/ShareOutlined';
import { Box, Drawer, alpha, styled, Divider, useTheme, Button, Stack, Popper, ClickAwayListener, Tooltip, Fab, Typography, Paper, IconButton } from '@mui/material';

import Scrollbar from 'src/components/Scrollbar';
import Logo from 'src/components/LogoSign';
import ChannelAvatar from 'src/components/ChannelAvatar'
import StyledButton from 'src/components/StyledButton'
import { SidebarContext } from 'src/contexts/SidebarContext';
import { OverPageContext } from 'src/contexts/OverPageContext';
import { HiveApi } from 'src/services/HiveApi'

const SidebarWrapper = styled(Box)(
  ({ theme }) => `
        width: ${theme.sidebarChannel.width};
        min-width: ${theme.sidebarChannel.width};
        color: ${theme.colors.alpha.trueWhite[70]};
        position: relative;
        z-index: 7;
        height: 100%;
        // padding-bottom: 68px;
`
);
const GradientOutlineFab = styled(Fab)(
  ({ theme }) => `
    &:before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 50%; 
      border-style: dotted;
      background: linear-gradient(90deg, #7624FE 0%, #368BFF 100%) border-box;
      -webkit-mask: 
        linear-gradient(#fff 0 0) content-box, 
        linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
              mask-composite: exclude; 
      transition: border-radius .2s
    }
    &:hover {
      border-radius: 16px;
      background: ${theme.colors.default.main};
    }
    &:hover:before {
      border-style: unset;
      padding: 2px;
      border-radius: 16px;
    }
    &:hover svg.MuiSvgIcon-root {
      fill: white;
    }
    background: transparent;
`
);
const GradientFab = styled(Fab)(
  ({ theme }) => `
    background: linear-gradient(90deg, #7624FE 0%, #368BFF 100%);
`
);
const StyledPopper = styled(Popper)(({ theme }) => ({ // You can replace with `PopperUnstyled` for lower bundle size.
  maxWidth: '350px',
  width: '100%',
  '&[data-popper-placement*="bottom"] .arrow': {
    top: 0,
    left: 0,
    marginTop: '-0.9em',
    width: '3em',
    height: '1em',
    '&::before': {
      borderWidth: '0 1em 1em 1em',
      borderColor: `transparent transparent ${theme.palette.background.paper} transparent`,
    },
  },
  '&[data-popper-placement*="top"] .arrow': {
    bottom: 0,
    left: 0,
    marginBottom: '-0.9em',
    width: '3em',
    height: '1em',
    '&::before': {
      borderWidth: '1em 1em 0 1em',
      borderColor: `${theme.palette.background.paper} transparent transparent transparent`,
    },
  },
  '&[data-popper-placement*="right"] .arrow': {
    left: 0,
    marginLeft: '-0.9em',
    height: '3em',
    width: '1em',
    '&::before': {
      borderWidth: '1em 1em 1em 0',
      borderColor: `transparent ${theme.palette.background.paper} transparent transparent`,
    },
  },
  '&[data-popper-placement*="left"] .arrow': {
    right: 0,
    marginRight: '-0.9em',
    height: '3em',
    width: '1em',
    '&::before': {
      borderWidth: '1em 0 1em 1em',
      borderColor: `transparent transparent transparent ${theme.palette.background.paper}`,
    },
  },
}));
function SidebarChannel() {
  const [selfChannels, setSelfChannels] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isOpenPopover, setOpenPopover] = useState(false);
  const [popoverChannel, setPopoverChannel] = useState({});
  const [arrowRef, setArrowRef] = useState(null);
  const { sidebarToggle, focusedChannel, toggleSidebar, setFocusChannel } = useContext(SidebarContext);
  const { setPageType } = useContext(OverPageContext)
  const closeSidebar = () => toggleSidebar();
  const theme = useTheme();
  const { pathname } = useLocation();
  const hiveApi = new HiveApi()
  
  useEffect(()=>{
    hiveApi.querySelfChannels()
      .then(res=>{
        if(Array.isArray(res))
          setSelfChannels(res)
      })
      .catch(err=>{
        console.log(err)
      })
  }, [])

  const handleClickChannel = (item)=>{
    setFocusChannel(item); 
    setPageType('CurrentChannel')
  }
  const handleRightClickChannel = (e, item)=>{
    e.preventDefault()
    handlePopoverOpen(e, item)
  }
  const handlePopoverOpen = (event, item) => {
    setAnchorEl(event.currentTarget)
    setPopoverChannel(item)
    setOpenPopover(true);
  };
  const handlePopoverClose = () => {
    setOpenPopover(false);
  };
  const styles = {
    arrow: {
        position: 'absolute',
        fontSize: 7,
        width: '3em',
        height: '3em',
        '&::before': {
          content: '""',
          margin: 'auto',
          display: 'block',
          width: 0,
          height: 0,
          borderStyle: 'solid',
        },
    }
  };
  
  return (
    <>
      <SidebarWrapper
        sx={{
          display: 'table',
          boxShadow: theme.palette.mode === 'dark' ? theme.sidebar.boxShadow : 'none'
        }}
      >
        <Box sx={{ display: 'table-row', height: '100%' }}>
          <Scrollbar>
            <Box mt={3} textAlign='center'>
              <Logo width={48} />
            </Box>
            <Divider
              sx={{
                mt: theme.spacing(2),
                mx: theme.spacing(2),
                background: theme.colors.alpha.trueWhite[10]
              }}
            />
            <Stack spacing={2} mt={2} alignItems='center'>
              {
                selfChannels.map((item, _i)=>
                  <ChannelAvatar 
                    key={_i} 
                    alt={item.name} 
                    src={`data:image/png;base64,${item.avatar}`}
                    onClick={(e)=>{handleClickChannel(item)}} 
                    onRightClick={(e)=>{handleRightClickChannel(e, item)}} 
                    focused={focusedChannel&&focusedChannel.name===item.name}/>
                )
              }
              <GradientOutlineFab aria-label="add" size='medium'>
                <svg width={0} height={0}>
                  <linearGradient id="linearColors" x1={0} y1={1} x2={1} y2={1}>
                    <stop offset={0} stopColor="#7624FE" />
                    <stop offset={1} stopColor="#368BFF" />
                  </linearGradient>
                </svg>
                <AddIcon sx={{ fill: "url(#linearColors)", fontSize: 24 }}/>
              </GradientOutlineFab>
            </Stack>
          </Scrollbar>
        </Box>
        <Stack spacing={2} alignItems='center' sx={{py: 2}}>
          <Fab 
            color='primary' 
            aria-label="setting" 
            size='medium' 
            component={RouterLink} 
            to='/setting/profile' 
            sx={
              pathname.startsWith('/setting') ? { background: 'linear-gradient(90deg, #7624FE 0%, #368BFF 100%)'} : {}
            }>
            <Icon icon="ep:setting" width={28} height={28} />
          </Fab>
          <Fab color='primary' aria-label="logout" size='medium'>
            <Icon icon="clarity:sign-out-line" width={28} height={28} />
          </Fab>
        </Stack>
      </SidebarWrapper>
      <ClickAwayListener onClickAway={() => handlePopoverClose()}>
        <StyledPopper
          anchorEl={anchorEl}
          open={isOpenPopover}
          placement="right-start"
          disablePortal={false}
          modifiers={[
            {
              name: 'flip',
              enabled: true,
              options: {
                altBoundary: true,
                rootBoundary: 'document',
                padding: 8,
              },
            },
            {
              name: 'preventOverflow',
              enabled: false,
              options: {
                altAxis: true,
                altBoundary: true,
                tether: true,
                rootBoundary: 'document',
                padding: 8,
              },
            },
            {
              name: 'arrow',
              enabled: true,
              options: {
                element: arrowRef,
              },
            },
          ]}
          sx={{zIndex: 100}}
        >
          <Box component="span" className="arrow" ref={setArrowRef} sx={styles.arrow} />
          <Paper sx={{p: 2}}>
            <Stack direction="row">
              <Typography variant="h5" pb={2} flex={1}>{popoverChannel['name']}</Typography>
              <Box sx={{display: 'inline-block'}}>
                <IconButton sx={{borderRadius: '50%', backgroundColor: (theme)=>theme.colors.primary.main, mr: 1}} size='small'><Icon icon="ant-design:share-alt-outlined" />
</IconButton>
                <IconButton sx={{borderRadius: '50%', backgroundColor: (theme)=>theme.colors.primary.main}} size='small'><Icon icon="clarity:note-edit-line" /></IconButton>
              </Box>
            </Stack>
            <Typography variant="body1" component='div' sx={{display: 'flex'}}><Icon icon="clarity:group-line" fontSize='20px' />&nbsp;100 Subscribers</Typography>
            <Typography variant="h6" py={1}>Recent Posts</Typography>
            <Typography variant="body2" color='text.secondary'>Good weather today in Osaka! Hmm... where should I eat in Tennouji? Any recommendations? I’m thinking of eating raw sushi for the first time though... I hope it’s gonna be alright haha#osaka #japan #spring</Typography>
            <Typography variant="body2" textAlign='right'>1m</Typography>
            <Divider/>
            <Typography variant="body2" color='text.secondary'>Good weather today in Osaka! Hmm... where should I eat in Tennouji? Any recommendations? I’m thinking of eating raw sushi for the first time though... I hope it’s gonna be alright haha#osaka #japan #spring</Typography>
            <Typography variant="body2" textAlign='right'>1d</Typography>
            <Box sx={{display: 'block'}} textAlign="center" p={2}>
              <StyledButton type="contained" fullWidth>Post</StyledButton>
            </Box>
          </Paper>
        </StyledPopper>
      </ClickAwayListener>
      {/* <Drawer
        sx={{
          boxShadow: `${theme.sidebar.boxShadow}`
        }}
        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
        open={sidebarToggle}
        onClose={closeSidebar}
        variant="temporary"
        elevation={9}
      >
        <SidebarWrapper
          sx={{
            background:
              theme.palette.mode === 'dark'
                ? theme.colors.alpha.white[100]
                : darken(theme.colors.alpha.black[100], 0.5)
          }}
        >
          <Scrollbar>
            <Box mt={3}>
              <Box
                mx={2}
              >
                <Logo />
              </Box>
            </Box>
            <Divider
              sx={{
                mt: theme.spacing(3),
                mx: theme.spacing(2),
                background: theme.colors.alpha.trueWhite[10]
              }}
            />
          </Scrollbar>
        </SidebarWrapper>
      </Drawer> */}
    </>
  );
}

export default SidebarChannel;
