import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { Stack, Box, Typography } from '@mui/material'

import StyledAvatar from 'components/StyledAvatar'
import StyledButton from 'components/StyledButton';
import { setChannelData } from 'redux/slices/channel';
import { selectMyInfo } from 'redux/slices/user';
import { HiveApi } from 'services/HiveApi';
import { getLocalDB } from 'utils/db';
import { decodeBase64 } from 'utils/common';

const PublicChannelItem = (props) => {
    const { channel } = props
    const subscribers = channel['subscribers'] || []
    const feedsDid = sessionStorage.getItem('FEEDS_DID')
    const myDID = `did:elastos:${feedsDid}`
    const isSubscribed = subscribers.map(item=>item.user_did).includes(myDID)
    const [isDoingSubscription, setIsDoingSubscription] = React.useState(false)
    const dispatch = useDispatch()
    const { enqueueSnackbar } = useSnackbar();
    const myInfo = useSelector(selectMyInfo)
    let avatarImg = channel['avatarSrc']
    if(!avatarImg.startsWith("http"))
        avatarImg = decodeBase64(avatarImg)
    const hiveApi = new HiveApi()
    const LocalDB = getLocalDB()

    const handleSubscription = () => {
        setIsDoingSubscription(true)
        const currentTime = new Date().getTime()
        const channel_id = channel['channel_id']
        Promise.resolve()
            .then(_=>{
                if(!isSubscribed)
                    return hiveApi.subscribeChannel(channel['target_did'], channel_id, myInfo['name'], currentTime)
                else
                    return hiveApi.unSubscribeChannel(channel['target_did'], channel_id)
            })
            .then(res=>LocalDB.get(channel._id))
            .then(doc=>{
                const updatedDoc = {...doc, is_subscribed: !isSubscribed}
                if(!isSubscribed) {
                    const newSubscriber = {
                        channel_id,
                        created_at: currentTime,
                        display_name: myInfo['name'],
                        status: 0,
                        updated_at: currentTime,
                        user_did: myDID
                    }
                    if(updatedDoc['subscribers'])
                        updatedDoc['subscribers'].push(newSubscriber)
                    else updatedDoc['subscribers'] = [newSubscriber]
                }
                else if(updatedDoc['subscribers']) {
                    const subscriberIndex = updatedDoc['subscribers'].findIndex(el=>el.user_did===myDID)
                    if(subscriberIndex>=0)
                        updatedDoc['subscribers'].splice(subscriberIndex, 1)
                }
                const subscriberObj = {}
                subscriberObj[channel_id] = { is_subscribed: updatedDoc['is_subscribed'], subscribers: updatedDoc['subscribers'] }
                dispatch(setChannelData(subscriberObj))
                LocalDB.put(updatedDoc)
            })
            .then(res=>{
                enqueueSnackbar(`${!isSubscribed? 'Subscribe': 'Unsubscribe'} channel success`, { variant: 'success' });
                setIsDoingSubscription(false)
            })
            .catch(err=>{
                enqueueSnackbar(`${!isSubscribed? 'Subscribe': 'Unsubscribe'} channel error`, { variant: 'error' });
                setIsDoingSubscription(false)
            })
    }

    return (
        <Stack direction="row" alignItems="center" spacing={1}>
            <StyledAvatar alt={channel['name']} src={avatarImg} width={32}/>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography component='div' variant="subtitle2" noWrap>
                    {channel['name']}
                </Typography>
                <Typography variant="body2" color='text.secondary' noWrap>
                    {subscribers?.length || 0} Subscribers
                </Typography>
            </Box>
            <Box>
                <StyledButton 
                    size='small' 
                    type={isSubscribed? "contained": "outlined"} 
                    loading={isDoingSubscription} 
                    needLoading={true} 
                    onClick={handleSubscription}
                    >
                    {isSubscribed? "Subscribed": "Subscribe"}
                </StyledButton>
            </Box>
        </Stack>
    )
}
export default React.memo(PublicChannelItem)