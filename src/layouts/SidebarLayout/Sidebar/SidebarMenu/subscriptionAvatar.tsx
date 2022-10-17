import React from 'react'

import StyledAvatar from 'components/StyledAvatar'
import { SidebarContext } from 'contexts/SidebarContext';
import { decodeBase64 } from 'utils/common';

const SubscriptionAvatar = (props) => {
    const { channel } = props
    const channelInfo = {...channel}
    if(channelInfo.avatarSrc) {
        channelInfo.avatarSrc = decodeBase64(channelInfo.avatarSrc)
    }
    return <StyledAvatar alt={channelInfo.name} src={channelInfo.avatarSrc} width={20}/>
}

export default SubscriptionAvatar