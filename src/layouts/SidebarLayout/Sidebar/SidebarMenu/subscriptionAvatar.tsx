import React from 'react'

import StyledAvatar from 'components/StyledAvatar'
import { SidebarContext } from 'contexts/SidebarContext';
import { decodeBase64 } from 'utils/common';

const SubscriptionAvatar = (props) => {
    const { channel } = props
    if(channel.avatarSrc) {
        channel.avatarSrc = decodeBase64(channel.avatarSrc)
    }
    return <StyledAvatar alt={channel.name} src={channel.avatarSrc} width={20}/>
}

export default SubscriptionAvatar