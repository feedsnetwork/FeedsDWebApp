import { useState, useContext, useEffect } from 'react';
import { NavLink as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Reveal from "react-awesome-reveal";
import { keyframes } from "@emotion/react";
import { Icon } from '@iconify/react';
import { alpha, Box, List, styled, Button, ListItem, InputAdornment, Divider, Typography, ListItemText, ListItemIcon, ListItemButton } from '@mui/material';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { SidebarContext } from 'contexts/SidebarContext';
import InputOutline from 'components/InputOutline'
import StyledButton from 'components/StyledButton';
import SubscriptionAvatar from './subscriptionAvatar'
import { SettingMenuArray } from 'utils/common'
import { LocalDB, QueryStep } from 'utils/db'
import { setActiveChannelId, setVisitedChannelId, selectFocusedChannelId } from 'redux/slices/channel';
import { handlePostModal, setActivePost } from 'redux/slices/post';

const MenuWrapper = styled(Box)(
  ({ theme }) => `
  .MuiList-root {
    padding: ${theme.spacing(1)};

    & > .MuiList-root {
      padding: 0 ${theme.spacing(0)} ${theme.spacing(1)};
    }
  }

    .MuiListSubheader-root {
      text-transform: uppercase;
      font-weight: bold;
      font-size: ${theme.typography.pxToRem(12)};
      color: ${theme.colors.alpha.trueWhite[50]};
      padding: ${theme.spacing(0, 2.5)};
      line-height: 1.4;
    }
`
);

const SubMenuWrapper = styled(Box)(
  ({ theme }) => `
    .MuiList-root {

      .MuiListItem-root {
        padding: 1px 0;

        .MuiBadge-root {
          position: absolute;
          right: ${theme.spacing(3.2)};

          .MuiBadge-standard {
            background: ${theme.colors.primary.main};
            font-size: ${theme.typography.pxToRem(10)};
            font-weight: bold;
            text-transform: uppercase;
            color: ${theme.palette.primary.contrastText};
          }
        }
    
        .MuiListItemButton-root,
        .MuiButton-root {
          display: flex;
          color: ${theme.colors.alpha.trueWhite[70]};
          background-color: transparent;
          width: 100%;
          justify-content: flex-start;
          padding: ${theme.spacing(1.2, 3)};

          .MuiButton-startIcon,
          .MuiButton-endIcon {
            transition: ${theme.transitions.create(['color'])};

            .MuiSvgIcon-root {
              font-size: inherit;
              transition: none;
            }
          }

          .MuiButton-startIcon {
            color: ${theme.colors.alpha.trueWhite[30]};
            font-size: ${theme.typography.pxToRem(20)};
            margin-right: ${theme.spacing(1)};
          }
          
          .MuiButton-endIcon {
            color: ${theme.colors.alpha.trueWhite[50]};
            margin-left: auto;
            opacity: .8;
            font-size: ${theme.typography.pxToRem(20)};
          }

          &.active,
          &:hover {
            background-color: ${alpha(theme.colors.alpha.trueWhite[100], 0.06)};
            color: ${theme.colors.alpha.trueWhite[100]};

            .MuiButton-startIcon,
            .MuiButton-endIcon {
              color: ${theme.colors.alpha.trueWhite[100]};
            }
          }
        }

        &.Mui-children {
          flex-direction: column;

          .MuiBadge-root {
            position: absolute;
            right: ${theme.spacing(7)};
          }
        }

        .MuiCollapse-root {
          width: 100%;

          .MuiList-root {
            padding: ${theme.spacing(1, 0)};
          }

          .MuiListItem-root {
            padding: 1px 0;

            .MuiButton-root {
              padding: ${theme.spacing(0.8, 3)};

              .MuiBadge-root {
                right: ${theme.spacing(3.2)};
              }

              &:before {
                content: ' ';
                background: ${theme.colors.alpha.trueWhite[100]};
                opacity: 0;
                transition: ${theme.transitions.create([
                  'transform',
                  'opacity'
                ])};
                width: 6px;
                height: 6px;
                transform: scale(0);
                transform-origin: center;
                border-radius: 20px;
                margin-right: ${theme.spacing(1.8)};
              }

              &.active,
              &:hover {

                &:before {
                  transform: scale(1);
                  opacity: 1;
                }
              }
            }
          }
        }
      }
    }
`
);

const MainMenuArray = [
  {to: '/home', name: 'Home', icon: 'clarity:home-line', focus_icon: 'clarity:home-solid'},
  {to: '/profile', name: 'Profile', icon: 'clarity:user-line', focus_icon: 'clarity:user-solid'},
  {to: '/channel', name: 'Channel', icon: 'bi:grid-3x3-gap', focus_icon: 'bi:grid-3x3-gap-fill'},
  {to: '/explore', name: 'Explore', icon: 'clarity:compass-line', focus_icon: 'clarity:compass-solid'},
]
const customAnimation = keyframes`
  from {
    opacity: 0;
    transform: translate3d(50px, 0px, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;
const customAnimationForChannels = keyframes`
  from {
    opacity: 0;
    transform: translate3d(0px, 20px, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

const ListItemButtonStyle = {
  '& svg.focused': {display: 'none'},
  '& svg.unfocused': {display: 'block'},
  '&.active svg.focused': {display: 'block'},
  '&.active svg.unfocused': {display: 'none'}
}

function SidebarMenu(props) {
  const { closeSidebar, queryStep } = useContext(SidebarContext);
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const { pathname } = useLocation()
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isVisibleChannels, setVisibleChannels] = useState(false)
  const isSettingPage = pathname.startsWith('/setting')
  const focusedChannelId = useSelector(selectFocusedChannelId)
  
  useEffect(()=>{
    if(queryStep >= QueryStep.subscribed_channel && !subscribedChannels.length) {
      LocalDB.find({
        selector: {
          table_type: 'channel', 
          is_subscribed: true
        },
      })
        .then(response=>{
          if(!response.docs.length)
            return
          setSubscribedChannels(response.docs)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryStep])

  const toggleChannels = (e) => {
    setVisibleChannels(!isVisibleChannels)
  }

  const link2detail = (e) => {
    const channel_id = e.currentTarget.value
    dispatch(setVisitedChannelId(channel_id))
    navigate('/subscription/channel');
  }

  const handlePostDlg = (e) => {
    dispatch(setActiveChannelId(0))
    dispatch(setActivePost(null))
    handlePostModal(true)(dispatch)
  }
  return (
    <>
      <MenuWrapper>
        <SubMenuWrapper>
          {
            !isSettingPage?
            <List component="div">
              {
                MainMenuArray.map((menuItem, _i)=>(
                  <ListItem component="div" key={_i}>
                    <ListItemButton component={RouterLink} to={menuItem.to} onClick={closeSidebar} sx={ListItemButtonStyle}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <Icon className='unfocused' icon={menuItem.icon} width={18} height={18} />
                        <Icon className='focused' icon={menuItem.focus_icon} width={18} height={18} />
                      </ListItemIcon>
                      <ListItemText primary={menuItem.name} primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItemButton>
                  </ListItem>
                ))
              }
              {
                subscribedChannels.length>0?
                <ListItem component="div">
                  <ListItemButton component={Button} onClick={toggleChannels} endIcon={isVisibleChannels ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon />} sx={ListItemButtonStyle}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <Icon icon='clarity:users-line' width={18} height={18} />
                    </ListItemIcon>
                    <ListItemText primary='Subscriptions' primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItemButton>
                </ListItem>:
                
                <ListItem component="div">
                  <ListItemButton component={RouterLink} to='/subscription' onClick={closeSidebar}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <Icon icon='clarity:users-line' width={18} height={18} />
                    </ListItemIcon>
                    <ListItemText primary='Subscription' primaryTypographyProps={{ variant: 'body2' }} />
                  </ListItemButton>
                </ListItem>
              }
              {
                isVisibleChannels&&
                <Reveal keyframes={customAnimationForChannels} duration={500}>
                  <Box px={2} textAlign="center">
                    <InputOutline
                      type="text"
                      placeholder="Search channels"
                      size="small"
                      startAdornment={
                        <InputAdornment position="start">
                          <SearchTwoToneIcon />
                        </InputAdornment>
                      }
                    />
                    <Box mt={1}>
                      {
                        subscribedChannels.map((channel, _i)=>(
                          <ListItem component="div" key={_i}>
                            <Button
                              value={channel.channel_id}
                              disableRipple
                              onClick={link2detail}
                              startIcon={<SubscriptionAvatar channel={channel}/>}
                              sx={{p: '4px 14px !important'}}
                            >
                              <Typography variant="body2" sx={{whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'}}>{channel.name}</Typography>
                            </Button>
                          </ListItem>
                        ))
                      }
                    </Box>
                    <Button color="inherit" size="small" sx={{px: 1}}>Show more</Button>
                  </Box>
                  <Divider sx={{mx: -1}}/>
                </Reveal>
              }
              {
                !!focusedChannelId &&
                <Box py={3} px={1} textAlign="center">
                  <StyledButton variant="contained" fullWidth onClick={handlePostDlg}>Post</StyledButton>
                </Box>
              }
            </List>:

            <Reveal keyframes={customAnimation}>
              <List component="div">
              {
                SettingMenuArray.map((menuItem, _i)=>(
                  <ListItem component="div" key={_i}>
                    <Button
                      disableRipple
                      component={RouterLink}
                      onClick={closeSidebar}
                      to={`/setting${menuItem.to}`}
                    >
                      {menuItem.name}
                    </Button>
                  </ListItem>
                ))
              }
              </List>
            </Reveal>
          }
        </SubMenuWrapper>
      </MenuWrapper>
    </>
  );
}

export default SidebarMenu;
