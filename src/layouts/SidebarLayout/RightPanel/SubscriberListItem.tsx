import React from 'react'
import { useSelector } from 'react-redux';
import { useNavigate, NavLink as RouterLink } from 'react-router-dom';
import { Stack, Box, Typography, Link } from '@mui/material'

import StyledAvatar from 'components/StyledAvatar'
import { selectUserInfoByDID } from 'redux/slices/user';
import { getImageSource } from 'utils/common';
import { getLocalDB } from 'utils/db';

const SubscriberListItem = (props) => {
    const { subscriber } = props
    const userInfo = useSelector(selectUserInfoByDID(subscriber.user_did)) || {}
    const userAvatarUrl = userInfo['avatar_url']
    const [avatarSrc, setAvatarSrc] = React.useState('')
    const navigate = useNavigate();
    const LocalDB = getLocalDB()

    React.useEffect(()=>{
        if(userAvatarUrl) {
            LocalDB.get(userAvatarUrl)
                .then(doc=>getImageSource(doc['source']))
                .then(setAvatarSrc)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userAvatarUrl])
    const handleLink2Profile = (user_did)=>{
        navigate('/profile/others', {state: {user_did}});
    }

    // const avatarContent = userInfo['avatarSrc'] || ""
    // const avatarSrc = decodeBase64(avatarContent)
    return (
        <Stack direction="row" alignItems="center" spacing={1}>
            <Box onClick={(e)=>{handleLink2Profile(subscriber.user_did)}} sx={{cursor: 'pointer'}}>
                <StyledAvatar alt={subscriber.display_name} src={avatarSrc} width={32}/>
            </Box>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography variant="subtitle2" noWrap>
                    <Link component={RouterLink} to="/profile/others" state={{user_did: subscriber.user_did}} sx={{color:'inherit'}}>
                        @{subscriber.display_name}
                    </Link>
                </Typography>
                {
                    userInfo['description'] &&
                    <Typography variant="body2" color='text.secondary' noWrap>{userInfo['description']}</Typography>
                }
            </Box>
        </Stack>
    )
}
export default React.memo(SubscriberListItem)