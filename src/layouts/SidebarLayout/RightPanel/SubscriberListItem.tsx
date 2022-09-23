import React from 'react'
import { useNavigate, NavLink as RouterLink } from 'react-router-dom';
import { Stack, Box, Typography, Link, styled } from '@mui/material'

import StyledAvatar from 'src/components/StyledAvatar'
import StyledButton from 'src/components/StyledButton'
import { HiveApi } from 'src/services/HiveApi'
import { SidebarContext } from 'src/contexts/SidebarContext';
import { getInfoFromDID } from 'src/utils/common'

const SubscriberListItem = (props) => {
    const { subscriber } = props
    const { subscriberInfo } = React.useContext(SidebarContext);
    const info_data = subscriberInfo[subscriber.user_did] || {}
    const navigate = useNavigate();

    const handleLink2Profile = (user_did)=>{
        navigate('/profile/others', {state: {user_did}});
    }

    return (
        <Stack direction="row" alignItems="center" spacing={1}>
            <Box onClick={(e)=>{handleLink2Profile(subscriber.user_did)}} sx={{cursor: 'pointer'}}>
                <StyledAvatar alt={subscriber.display_name} src={info_data['avatar']} width={32}/>
            </Box>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography variant="subtitle2" noWrap>
                    <Link component={RouterLink} to="/profile/others" state={{user_did: subscriber.user_did}} sx={{color:'inherit'}}>
                        @{subscriber.display_name}
                    </Link>
                </Typography>
                {
                    info_data['info'] && info_data['info']['description'] &&
                    <Typography variant="body2" color='text.secondary' noWrap>{info_data['info']['description']}</Typography>
                }
            </Box>
        </Stack>
    )
}
export default React.memo(SubscriberListItem)