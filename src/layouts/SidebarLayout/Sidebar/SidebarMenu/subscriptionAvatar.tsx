import React from 'react'

import StyledAvatar from 'src/components/StyledAvatar'
import { SidebarContext } from 'src/contexts/SidebarContext';
import { HiveApi } from 'src/services/HiveApi'

const SubscriptionAvatar = (props) => {
    const { channel, index } = props
    const { subscribedChannels, setSubscribedChannels } = React.useContext(SidebarContext);
    const [avatarSrc, setAvatarSrc] = React.useState('')
    const feedsDid = sessionStorage.getItem('FEEDS_DID')
    const userDid = `did:elastos:${feedsDid}`
    const hiveApi = new HiveApi()

    React.useEffect(()=>{
      hiveApi.downloadScripting(channel.target_did, channel.avatar)
        .then(res=>{
          setAvatarSrc(res)
          setSubscribedChannels(prev=>{
            const prevState = [...prev]
            prevState[index].avatarSrc = res
            return prevState
          })
        })
        .catch(err=>{
          console.log(err)
        })
    }, [])

    return <StyledAvatar alt={channel.name} src={subscribedChannels[index].avatarSrc} width={20}/>
}

export default SubscriptionAvatar