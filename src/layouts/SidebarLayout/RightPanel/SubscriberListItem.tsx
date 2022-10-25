import React from 'react'
import { useSelector } from 'react-redux';
import { useNavigate, NavLink as RouterLink } from 'react-router-dom';
import { Stack, Box, Typography, Link } from '@mui/material'

import StyledAvatar from 'components/StyledAvatar'
import { SidebarContext } from 'contexts/SidebarContext';
import { selectUserAvatar } from 'redux/slices/user';
import { LocalDB, QueryStep } from 'utils/db'
import { decodeBase64 } from 'utils/common';

const SubscriberListItem = (props) => {
    const { subscriber } = props
    const { queryStep } = React.useContext(SidebarContext);
    const [ userInfo, setSubscriberInfo] = React.useState({})
    const userAvatarSrc = useSelector(selectUserAvatar)
    const navigate = useNavigate();

    React.useEffect(()=>{
        if(queryStep>=QueryStep.subscriber_info) {
            LocalDB.get(subscriber.user_did)
                .then(doc=>{
                    setSubscriberInfo(doc)
                })
                .catch(err=>{})
        }
    }, [queryStep, subscriber])

    const handleLink2Profile = (user_did)=>{
        navigate('/profile/others', {state: {user_did}});
    }

    const avatarContent = userAvatarSrc[subscriber.user_did] || ""
    const avatarSrc = decodeBase64(avatarContent)
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