import React from 'react'
import { Stack, Box, Typography } from '@mui/material'

import StyledAvatar from 'src/components/StyledAvatar'
import StyledButton from 'src/components/StyledButton'
import { HiveApi } from 'src/services/HiveApi'
import { SidebarContext } from 'src/contexts/SidebarContext';
import { getInfoFromDID } from 'src/utils/common'

const SubscriberListItem = (props) => {
    const { subscriber } = props
    const { subscriberInfo } = React.useContext(SidebarContext);

    // const [moreInfo, setMoreInfo] = React.useState({fullName: '', avatarSrc: ''})

    // React.useEffect(()=>{
    //     getInfoFromDID(subscriber.user_did).then(res=>{
    //         console.log(res, "=============3sl")
    //         setMoreInfo(prevState => {
    //             const tempState = {...prevState}
    //             tempState.fullName = res['name']
    //             return tempState
    //         })
    //     })
    // }, [])
    // console.log(subscriber)
    const info_data = subscriberInfo[subscriber.user_did] || {}
    return (
        <Stack direction="row" alignItems="center" spacing={1}>
            <StyledAvatar alt={subscriber.display_name} src={info_data['avatar']} width={32}/>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography component='div' variant="subtitle2" noWrap>@{subscriber.display_name}</Typography>
                {
                    info_data['info'] && info_data['info']['description'] &&
                    <Typography variant="body2" color='text.secondary' noWrap>{info_data['info']['description']}</Typography>
                }
            </Box>
            <StyledButton type="outlined" size='small' sx={{whiteSpace: 'nowrap', px: '30px'}}>View Profile</StyledButton>
        </Stack>
    )
}
export default SubscriberListItem