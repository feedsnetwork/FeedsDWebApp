import StyledAvatar from 'components/StyledAvatar'
import { decodeBase64 } from 'utils/common';

const SubscriptionAvatar = (props) => {
    const { channel } = props
    let thisChannelAvatar = channel['avatarSrc']
    if(thisChannelAvatar) {
        thisChannelAvatar = decodeBase64(thisChannelAvatar)
    }
    return <StyledAvatar alt={channel['display_name']} src={thisChannelAvatar} width={20}/>
}

export default SubscriptionAvatar