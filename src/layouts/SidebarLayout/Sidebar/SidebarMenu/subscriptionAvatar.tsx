import StyledAvatar from 'components/StyledAvatar'
import { getImageSource } from 'utils/common';

const SubscriptionAvatar = (props) => {
    const { channel } = props
    let thisChannelAvatar = getImageSource(channel['avatarSrc'])
    return <StyledAvatar alt={channel['display_name']} src={thisChannelAvatar} width={20}/>
}

export default SubscriptionAvatar