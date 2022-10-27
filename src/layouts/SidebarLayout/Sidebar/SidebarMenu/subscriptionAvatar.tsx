import { useSelector } from 'react-redux';
import StyledAvatar from 'components/StyledAvatar'
import { decodeBase64 } from 'utils/common';
import { selectChannelAvatar } from 'redux/slices/channel';

const SubscriptionAvatar = (props) => {
    const { channel } = props
    const channelInfo = {...channel}
    const channelAvatars = useSelector(selectChannelAvatar)
    let thisChannelAvatar = channelAvatars[channel.channel_id]
    if(thisChannelAvatar) {
        thisChannelAvatar = decodeBase64(thisChannelAvatar)
    }
    return <StyledAvatar alt={channelInfo.name} src={thisChannelAvatar} width={20}/>
}

export default SubscriptionAvatar