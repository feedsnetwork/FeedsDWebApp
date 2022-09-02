import { useState, useContext } from 'react';
import { NavLink as RouterLink, useLocation } from 'react-router-dom';
import FadeIn from 'react-fade-in';
// import { Fade } from "react-awesome-reveal";
import Reveal from "react-awesome-reveal";
import { keyframes } from "@emotion/react";
import { ListSubheader, alpha, Box, List, styled, Button, ListItem, InputAdornment, Divider } from '@mui/material';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { SidebarContext } from 'src/contexts/SidebarContext';
import InputOutline from 'src/components/InputOutline'
import StyledButton from 'src/components/StyledButton';
import PostDlg from 'src/components/Modal/Post';
import SubscriptionAvatar from './subscriptionAvatar'
import { SettingMenuArray } from 'src/utils/common'

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
  {to: '/home', name: 'Home'},
  {to: '/profile', name: 'Profile'},
  {to: '/channel', name: 'Channel'},
  {to: '/explorer', name: 'Explorer'},
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

function SidebarMenu(props) {
  const { closeSidebar, subscribedChannels } = useContext(SidebarContext);
  const { pathname } = useLocation()
  const [isVisibleChannels, setVisibleChannels] = useState(false)
  const [isOpenPost, setOpenPost] = useState(false)
  const isSettingPage = pathname.startsWith('/setting')
  
  const toggleChannels = (e) => {
    setVisibleChannels(!isVisibleChannels)
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
                    <Button
                      disableRipple
                      component={RouterLink}
                      onClick={closeSidebar}
                      to={menuItem.to}
                    >
                      {menuItem.name}
                    </Button>
                  </ListItem>
                ))
              }
              {
                subscribedChannels.length>0?
                <ListItem component="div">
                  <Button disableRipple onClick={toggleChannels} endIcon={isVisibleChannels ? <KeyboardArrowUpIcon/> : <KeyboardArrowDownIcon />} >
                    Subscriptions
                  </Button>
                </ListItem>:
                
                <ListItem component="div">
                  <Button
                    disableRipple
                    component={RouterLink}
                    onClick={closeSidebar}
                    to='/subscription'
                    // startIcon={<AccountCircleTwoToneIcon />}
                  >
                    Subscription
                  </Button>
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
                              disableRipple
                              // component={RouterLink}
                              // to={menuItem.to}
                              // onClick={closeSidebar}
                              startIcon={<SubscriptionAvatar channel={channel}/>}
                              sx={{p: '4px 14px !important'}}
                            >
                              {channel.name}
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
              <Box py={3} px={1} textAlign="center">
                <StyledButton variant="contained" fullWidth onClick={()=>{setOpenPost(true)}}>Post</StyledButton>
              </Box>
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
      <PostDlg setOpen={setOpenPost} isOpen={isOpenPost}/>
    </>
  );
}

export default SidebarMenu;
