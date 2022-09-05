import React from 'react'

import StyledAvatar from 'src/components/StyledAvatar'
import { SidebarContext } from 'src/contexts/SidebarContext';

const SubscriptionAvatar = (props) => {
    const { channel, index } = props
    const { subscribedChannels } = React.useContext(SidebarContext);

    return <StyledAvatar alt={channel.name} src={subscribedChannels[index].avatarSrc} width={20}/>
}

export default SubscriptionAvatar