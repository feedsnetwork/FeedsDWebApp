import { useState, useContext, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import parse from 'html-react-parser';
import { Icon } from '@iconify/react';
import AddIcon from '@mui/icons-material/Add';
import { Box, styled, Divider, useTheme, Stack, Popper, ClickAwayListener, Tooltip, Fab, Typography, Paper, IconButton } from '@mui/material';

import Scrollbar from 'components/Scrollbar';
import Logo from 'components/LogoSign';
import ChannelAvatar from 'components/ChannelAvatar'
import StyledButton from 'components/StyledButton'
import SignoutDlg from 'components/Modal/Signout';
import { SidebarContext } from 'contexts/SidebarContext';
import { sortByDate, isValidTime, getDateDistance, convertAutoLink } from 'utils/common'
import { LocalDB, QueryStep } from 'utils/db'
import { selectFocusedChannelId, setActiveChannelId, setFocusedChannelId } from 'redux/slices/channel';
import { handlePostModal, setActivePost } from 'redux/slices/post';

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
  const { queryStep } = useContext(SidebarContext);
  const [selfChannels, setSelfChannels] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isOpenPopover, setOpenPopover] = useState(false);
  const [popoverChannel, setPopoverChannel] = useState({});
  const [recentPosts, setRecentPosts] = useState([]);
  const [arrowRef, setArrowRef] = useState(null);
  const [isOpenSignout, setOpenSignout] = useState(false)
  // const closeSidebar = () => toggleSidebar();
  const theme = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const focusedChannelId = useSelector(selectFocusedChannelId)

  // useEffect(()=>{
  //   const worker = new Worker('worker.js');
  //   worker.addEventListener('message', event => {
  //     console.info(event.data)
  //   });
  //   worker.postMessage("hello")

  // }, [])

  useEffect(()=>{
    if(queryStep >= QueryStep.self_channel && !selfChannels.length) {
      LocalDB.find({
        selector: {
          table_type: 'channel', 
          is_self: true
        },
      })
        .then(response=>{
          if(!response.docs.length)
            return
          setSelfChannels(response.docs)
          dispatch(setFocusedChannelId(response.docs[0]['channel_id']))
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryStep])
  
  const handleClickChannel = (item)=>{
    dispatch(setFocusedChannelId(item.channel_id))
  }
  const handleRightClickChannel = (e, item)=>{
    e.preventDefault()
    handlePopoverOpen(e, item)
  }
  const handlePopoverOpen = (event, item) => {
    setAnchorEl(event.currentTarget)
    setPopoverChannel(item)
    setOpenPopover(true);
    LocalDB.find({
      selector: {
        table_type: 'post',
        channel_id: item.channel_id
      }
    })
      .then(response => {
        const recentPosts = sortByDate(response.docs)
          .slice(0, 2)
          .map(post=>{
            const distanceTime = isValidTime(post.created_at)?getDateDistance(post.created_at):''
            if(post.status === 1)
              post.content_filtered = "(post deleted)"
            else {
              const contentObj = JSON.parse(post.content)
              post.content_filtered = convertAutoLink(contentObj.content)
            }
            post.distanceTime = distanceTime
            return post
          })
        setRecentPosts(recentPosts)
      })
      .catch(err => {})
  };
  const handlePopoverClose = () => {
    setOpenPopover(false);
  };
  const handleClickPost = (e) => {
    setOpenPopover(false);
    dispatch(setActiveChannelId(popoverChannel['channel_id']))
    dispatch(setActivePost(null))
    handlePostModal(true)(dispatch)
  }
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
                    channel={item}
                    onClick={(e)=>{handleClickChannel(item)}} 
                    onRightClick={(e)=>{handleRightClickChannel(e, item)}} 
                    focused={focusedChannelId&&focusedChannelId===item.channel_id}/>
                )
              }
              <Tooltip title="Add new channel" arrow disableInteractive enterTouchDelay={0}>
                <GradientOutlineFab aria-label="add" size='medium' onClick={()=>{navigate('/channel/add')}}>
                  <svg width={0} height={0}>
                    <linearGradient id="linearColors" x1={0} y1={1} x2={1} y2={1}>
                      <stop offset={0} stopColor="#7624FE" />
                      <stop offset={1} stopColor="#368BFF" />
                    </linearGradient>
                  </svg>
                  <AddIcon sx={{ fill: "url(#linearColors)", fontSize: 24 }}/>
                </GradientOutlineFab>
              </Tooltip>
            </Stack>
          </Scrollbar>
        </Box>
        <Stack spacing={2} alignItems='center' sx={{py: 2}}>
          <Tooltip title="Settings" arrow disableInteractive enterTouchDelay={0}>
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
          </Tooltip>
          <Tooltip title="Sign out" arrow disableInteractive enterTouchDelay={0}>
            <Fab color='primary' aria-label="logout" size='medium' onClick={(e)=>setOpenSignout(true)}>
              <Icon icon="clarity:sign-out-line" width={28} height={28} />
            </Fab>
          </Tooltip>
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
                <IconButton sx={{borderRadius: '50%', backgroundColor: (theme)=>theme.colors.primary.main, mr: 1}} size='small'><Icon icon="ant-design:share-alt-outlined" /></IconButton>
                <IconButton sx={{borderRadius: '50%', backgroundColor: (theme)=>theme.colors.primary.main}} size='small'><Icon icon="clarity:note-edit-line" /></IconButton>
              </Box>
            </Stack>
            <Typography variant="body1" component='div' sx={{display: 'flex'}}><Icon icon="clarity:group-line" fontSize='20px' />&nbsp;{popoverChannel['subscribers']?popoverChannel['subscribers'].length:0} Subscribers</Typography>
            <Typography variant="h6" py={1}>Recent Posts</Typography>
            {
              recentPosts.map((post, _i)=>(
                <Box key={_i}>
                  <Typography variant="body2" color='text.secondary'>{parse(post.content_filtered)}</Typography>
                  <Typography variant="body2" textAlign='right'>{post.distanceTime}</Typography>
                  {
                    _i<recentPosts.length-1 &&
                    <Divider sx={{mb: 1}}/>
                  }
                </Box>
              ))
            }
            {
              !recentPosts.length &&
              <Typography variant="body2" py={1}>No recent post found</Typography>
            }
            <Box sx={{display: 'block'}} textAlign="center" p={2}>
              <StyledButton type="contained" fullWidth onClick={handleClickPost}>Post</StyledButton>
            </Box>
          </Paper>
        </StyledPopper>
      </ClickAwayListener>
      <SignoutDlg setOpen={setOpenSignout} isOpen={isOpenSignout}/>
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
