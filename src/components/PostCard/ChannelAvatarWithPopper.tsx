import React from 'react'
import { NavLink as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux'
import { Icon } from '@iconify/react';
import { Box, Paper, Stack, Divider, AvatarGroup, Fade, Popper, styled, Typography, Link, Avatar } from '@mui/material';

import StyledAvatar from 'components/StyledAvatar'
import SubscribeButton from 'components/SubscribeButton';
import ChannelName from 'components/ChannelName';
import NoRingAvatar from 'components/NoRingAvatar';
import { selectChannelById } from 'redux/slices/channel';
import { selectUserInfoByDID } from 'redux/slices/user';
import { getImageSource } from 'utils/common'
import { getLocalDB } from 'utils/db';

const StyledPopper = styled(Popper)(({ theme }) => ({ // You can replace with `PopperUnstyled` for lower bundle size.
    maxWidth: '350px',
    width: '100%',
    '&[data-popper-placement*="bottom"] .arrow': {
      top: 0,
      left: 0,
      marginTop: '-0.9em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '0 1em 1em 1em',
        borderColor: `transparent transparent ${theme.palette.background.paper} transparent`,
      },
    },
    '&[data-popper-placement*="top"] .arrow': {
      bottom: 0,
      left: 0,
      marginBottom: '-0.9em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '1em 1em 0 1em',
        borderColor: `${theme.palette.background.paper} transparent transparent transparent`,
      },
    },
    '&[data-popper-placement*="right"] .arrow': {
      left: 0,
      marginLeft: '-0.9em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 1em 1em 0',
        borderColor: `transparent ${theme.palette.background.paper} transparent transparent`,
      },
    },
    '&[data-popper-placement*="left"] .arrow': {
      right: 0,
      marginRight: '-0.9em',
      height: '3em',
      width: '1em',
      '&::before': {
        borderWidth: '1em 0 1em 1em',
        borderColor: `transparent transparent transparent ${theme.palette.background.paper}`,
      },
    },
  }));
const SubscriberAvatar = (props) => {
    const { subscriber } = props
    const userInfo = useSelector(selectUserInfoByDID(subscriber.user_did)) || {}
    const userAvatarUrl = userInfo['avatar_url']
    const [avatarSrc, setAvatarSrc] = React.useState('')
    const LocalDB = getLocalDB()
    React.useEffect(()=>{
        if(userAvatarUrl) {
            LocalDB.get(userAvatarUrl)
                .then(doc=>getImageSource(doc['source']))
                .then(setAvatarSrc)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userAvatarUrl])

    return (
        <Avatar sx={{ width: 'auto', height: 'auto', background: 'none' }}>
            <StyledAvatar alt={subscriber.display_name} src={avatarSrc} width={18}/>
        </Avatar>
    )
}
const ChannelAvatarWithPopper = (props) => {
    const { contentObj, isReply, level=1, channel_id, handleLink2Channel, handleLink2Profile } = props
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [isOpenPopover, setOpenPopover] = React.useState(false);
    const currentChannel = useSelector(selectChannelById(channel_id)) || {}
    const subscribersOfThis = currentChannel['subscribers'] || []
    const subscribedByWho = `Subscribed by ${subscribersOfThis.slice(0,3).map(subscriber=>subscriber.display_name).join(', ')}${subscribersOfThis.length>3?' and more!':'.'}`

    const handlePopper = (e, open)=>{
      if(open)
        setAnchorEl(e.target)
      setOpenPopover(open)
    }
    const AvatarComponent = (level===2 && !contentObj.avatar.isChannel)? StyledAvatar: NoRingAvatar
    return (
        <>
            <Box
                onMouseEnter={(e)=>{handlePopper(e, true)}}
                onMouseLeave={(e)=>{handlePopper(e, false)}}
                onClick={level===1? handleLink2Channel: handleLink2Profile}
                sx={{cursor: 'pointer'}}
            >
                <AvatarComponent alt={contentObj.avatar.name} src={contentObj.avatar.src} width={isReply?40:47}/>
            </Box>
            {
                level===1 &&
                <StyledPopper
                    anchorEl={anchorEl}
                    open={isOpenPopover}
                    disablePortal={false}
                    onMouseEnter={(e)=>{setOpenPopover(true)}}
                    onMouseLeave={(e)=>{handlePopper(e, false)}}
                    modifiers={[
                        {
                            name: 'flip',
                            enabled: true,
                            options: {
                            altBoundary: true,
                            rootBoundary: 'document',
                            padding: 8,
                            },
                        },
                        {
                            name: 'preventOverflow',
                            enabled: false,
                            options: {
                            altAxis: true,
                            altBoundary: true,
                            tether: true,
                            rootBoundary: 'document',
                            padding: 8,
                            },
                        },
                    ]}
                    onClick={(e)=>{e.stopPropagation()}}
                    sx={{zIndex: 100}}
                    transition
                >
                    {
                        ({ TransitionProps }) => (
                            <Fade {...TransitionProps}>
                                <Paper sx={{p: 2}}>
                                    <Stack direction="row">
                                        <Box onClick={handleLink2Channel} sx={{cursor: 'pointer'}}>
                                            <NoRingAvatar alt={contentObj.avatar.name} src={contentObj.avatar.src} width={40}/>
                                        </Box>
                                        <Box sx={{flexGrow: 1}} textAlign="right">
                                            <SubscribeButton channel={currentChannel}/>
                                        </Box>
                                    </Stack>
                                    <Box>
                                        <Typography component='div' variant="subtitle2" noWrap pt={1}>
                                            <Link sx={{color:'inherit', cursor: 'pointer'}} onClick={handleLink2Channel}>
                                                {/* {contentObj.primaryName} */}
                                                <ChannelName name={contentObj.primaryName} isPublic={currentChannel['is_public']} variant="div"/>
                                            </Link>
                                        </Typography>
                                        <Typography component='div' variant="body2" noWrap>
                                            <Link sx={{color:'inherit', cursor: 'pointer'}} onClick={handleLink2Profile}>
                                                {contentObj.secondaryName}
                                            </Link>
                                        </Typography>
                                        <Typography component='div' variant="body2" color="secondary">{currentChannel['intro']}</Typography>
                                    </Box>
                                    <Divider sx={{my: 1}}/>
                                    <Link component={RouterLink} to={`/subscriber/list/${currentChannel['channel_id']}`} sx={{color:'inherit'}}>
                                        <Typography variant="body2" component='div' sx={{display: 'flex'}}>
                                            <Icon icon="clarity:group-line" fontSize='20px' />&nbsp;
                                            {subscribersOfThis.length} Subscribers
                                        </Typography>
                                    </Link>
                                    {
                                        subscribersOfThis.length>0 &&
                                        <Stack direction="row" mt={1} spacing={1}>
                                            <AvatarGroup spacing={10}>
                                            {
                                                subscribersOfThis.slice(0, 3).map((subscriber, _i)=>(
                                                    <SubscriberAvatar subscriber={subscriber} key={_i} />
                                                ))
                                            }
                                            </AvatarGroup>
                                            <Typography variant="body2" flex={1}>{subscribedByWho}</Typography>
                                        </Stack>
                                    }
                                </Paper>
                            </Fade>
                        )
                    }
                </StyledPopper>
            }
        </>
    );
}

export default React.memo(ChannelAvatarWithPopper);