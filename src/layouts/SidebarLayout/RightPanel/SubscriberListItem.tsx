import React from 'react'
import { Stack, Box, Typography } from '@mui/material'

import StyledAvatar from 'src/components/StyledAvatar'
import { HiveApi } from 'src/services/HiveApi'
import { getInfoFromDID } from 'src/utils/common'

const SubscriberListItem = (props) => {
    const { subscriber } = props
    const [avatarSrc, setAvatarSrc] = React.useState('')
    const hiveApi = new HiveApi()

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
    React.useEffect(()=>{
        hiveApi.getHiveUrl(subscriber.user_did)
          .then(async hiveUrl=>{
            const res =  await hiveApi.downloadFileByHiveUrl(subscriber.user_did, hiveUrl)
            if(res && res.length) {
              const base64Content = res.toString('base64')
              setAvatarSrc(`data:image/png;base64,${base64Content}`)
            }
          })
    }, [])

    return (
        <Stack direction="row" alignItems="center" spacing={1}>
            <StyledAvatar alt={subscriber.display_name} src={avatarSrc} width={32}/>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography component='div' variant="subtitle2" noWrap>{subscriber.display_name}</Typography>
                <Typography variant="body2" color='text.secondary' noWrap>@{subscriber.display_name}</Typography>
            </Box>
        </Stack>
    )
}
export default SubscriberListItem