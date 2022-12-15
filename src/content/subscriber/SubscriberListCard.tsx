import React from 'react'
import { useSelector } from 'react-redux';
import { useNavigate, NavLink as RouterLink } from 'react-router-dom';
import { Card, Box, Typography, Stack, Link, Hidden } from '@mui/material';

import StyledAvatar from 'components/StyledAvatar';
import { selectUserInfoByDID } from 'redux/slices/user';
import { getImageSource } from 'utils/common'
import { getLocalDB } from 'utils/db';

const SubscriberListCard = (props) => {
  const {subscriber} = props
  const userInfo = useSelector(selectUserInfoByDID(subscriber.user_did)) || {}
  const userAvatarUrl = userInfo['avatar_url']
  const [avatarSrc, setAvatarSrc] = React.useState('')
  const navigate = useNavigate()
  const LocalDB = getLocalDB()

  React.useEffect(()=>{
    if(userAvatarUrl) {
      LocalDB.get(userAvatarUrl)
        .then(doc=>getImageSource(doc['source']))
        .then(setAvatarSrc)
    }
    else
      setAvatarSrc('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAvatarUrl])

  const handleLink2Profile = (user_did)=>{
      navigate('/profile/others', {state: {user_did}});
  }
  return <Card sx={{background: (theme)=>theme.palette.primary.main, p: 2}}>
    <Stack direction="row" spacing={2} alignItems="center">
      <Box onClick={(e)=>{handleLink2Profile(subscriber.user_did)}} sx={{cursor: 'pointer'}}>
        <StyledAvatar alt={subscriber.display_name} src={avatarSrc} width={32}/>
      </Box>
      <Box flex={1}>
        <Hidden mdDown>
          <Typography variant="subtitle2" noWrap>
            <Link component={RouterLink} to="/profile/others" state={{user_did: subscriber.user_did}} sx={{color:'inherit'}}>
              @{subscriber.display_name}
            </Link>
          </Typography>
          {
            !!userInfo['description'] &&
            <Typography variant="body2" color='text.secondary'>{userInfo['description']}</Typography>
          }
        </Hidden>
      </Box>
    </Stack>
    <Hidden mdUp>
      <Box mt={1}>
        <Typography variant="subtitle2" noWrap>
          <Link component={RouterLink} to="/profile/others" state={{user_did: subscriber.user_did}} sx={{color:'inherit'}}>
            @{subscriber.display_name}
          </Link>
        </Typography>
        {
          !!userInfo['description'] &&
          <Typography variant="body2" color='text.secondary'>{userInfo['description']}</Typography>
        }
      </Box>
    </Hidden>
  </Card>
}

export default SubscriberListCard;
