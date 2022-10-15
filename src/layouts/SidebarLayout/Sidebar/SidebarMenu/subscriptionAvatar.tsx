import React from 'react'

import StyledAvatar from 'components/StyledAvatar'
import { SidebarContext } from 'contexts/SidebarContext';

const SubscriptionAvatar = (props) => {
    const { channel } = props

    return <StyledAvatar alt={channel.name} src={channel.avatarSrc} width={20}/>
}

export default SubscriptionAvatar