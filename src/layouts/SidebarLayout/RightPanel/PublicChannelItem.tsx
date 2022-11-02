import React from 'react'
import { useSelector } from 'react-redux';
import { Stack, Box, Typography } from '@mui/material'

import StyledAvatar from 'components/StyledAvatar'
import StyledButton from 'components/StyledButton';
import { selectSubscribers } from 'redux/slices/channel';

const PublicChannelItem = (props) => {
    const { channel } = props
    const subscribersOfChannel = useSelector(selectSubscribers)
    const subscribers = subscribersOfChannel[channel.channel_id] || []
    const feedsDid = sessionStorage.getItem('FEEDS_DID')
    const myDID = `did:elastos:${feedsDid}`
    const isSubscribed = subscribers.map(item=>item.user_did).includes(myDID)

    return (
        <Stack direction="row" alignItems="center" spacing={1}>
            <StyledAvatar alt={channel['name']} src={channel['avatarSrc']} width={32}/>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography component='div' variant="subtitle2" noWrap>
                    {channel['name']}
                </Typography>
                <Typography variant="body2" color='text.secondary' noWrap>
                    {subscribersOfChannel[channel.channel_id]?.length || 0} Subscribers
                </Typography>
            </Box>
            <Box>
                {
                    isSubscribed?
                    <StyledButton type="contained" size='small'>Subscribed</StyledButton>:
                    <StyledButton type="outlined" size='small'>Subscribe</StyledButton>
                }
            </Box>
        </Stack>
    )
}
export default React.memo(PublicChannelItem)