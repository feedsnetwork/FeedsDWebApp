import { useState, useContext, useEffect } from 'react';
import { NavLink as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from '@iconify/react';
import { Box, Button, ListItem, ListItemText, ListItemIcon, ListItemButton, Typography } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import SubscriptionAvatar from './subscriptionAvatar'
import { SidebarContext } from 'contexts/SidebarContext';
import { selectSubscribedChannels, setVisitedChannelId } from 'redux/slices/channel';

const ListItemButtonStyle = {
  '& svg.focused': {display: 'none'},
  '& svg.unfocused': {display: 'block'},
  '&.active svg.focused': {display: 'block'},
  '&.active svg.unfocused': {display: 'none'}
}

function Subscriptions() {
  const subscribedChannels = Object.values(useSelector(selectSubscribedChannels))
  const [totalPage, setTotalPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isVisibleChannels, setVisibleChannels] = useState(false)
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  useEffect(()=>{
    setTotalPage(Math.ceil(subscribedChannels.length/10))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribedChannels])

  const toggleChannels = (e) => {
    setVisibleChannels(!isVisibleChannels)
  }

  const link2detail = (e) => {
    const channel_id = e.currentTarget.value
    dispatch(setVisitedChannelId(channel_id))
    navigate('/subscription/channel');
  }

  const handleShowMore = () => {
    setCurrentPage(currentPage+1)
  }

  return (
    <>
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
          <ListItemButton component={RouterLink} to='/subscription'>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <Icon icon='clarity:users-line' width={18} height={18} />
            </ListItemIcon>
            <ListItemText primary='Subscription' primaryTypographyProps={{ variant: 'body2' }} />
          </ListItemButton>
        </ListItem>
      }
      
      <Box px={2} textAlign="center" style={{display: isVisibleChannels? 'block': 'none'}}>
        {/* <InputOutline
          type="text"
          placeholder="Search channels"
          size="small"
          startAdornment={
            <InputAdornment position="start">
              <SearchTwoToneIcon />
            </InputAdornment>
          }
        /> */}
        <Box mt={1}>
          {
            subscribedChannels.slice(0, 10*currentPage).map((channel, _i)=>(
              <ListItem component="div" key={_i}>
                <Button
                  value={channel['channel_id']}
                  disableRipple
                  onClick={link2detail}
                  startIcon={<SubscriptionAvatar channel={channel}/>}
                  sx={{p: '4px 14px !important'}}
                >
                  <Typography variant="body2" sx={{whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden'}}>{channel['display_name']}</Typography>
                </Button>
              </ListItem>
            ))
          }
        </Box>
        {
          currentPage<totalPage &&
          <Button color="inherit" size="small" sx={{px: 1}} onClick={handleShowMore}>Show more</Button>
        }
      </Box>
    </>
  );
}

export default Subscriptions;
