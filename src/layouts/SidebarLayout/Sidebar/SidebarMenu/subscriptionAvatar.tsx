import React from 'react'

import StyledAvatar from 'src/components/StyledAvatar'
import { HiveApi } from 'src/services/HiveApi'

const SubscriptionAvatar = (props) => {
    const { channel } = props
    const [avatarSrc, setAvatarSrc] = React.useState('')
    const hiveApi = new HiveApi()

    React.useEffect(()=>{
        const parseAvatar = channel['avatar'].split('@')
        hiveApi.downloadCustomeAvatar(parseAvatar[parseAvatar.length-1])
          .then(res=>{
            if(res && res.length) {
              const base64Content = res.reduce((content, code)=>{
                content=`${content}${String.fromCharCode(code)}`;
                return content
              }, '')
              setAvatarSrc(base64Content)
            }
          })
          .catch(err=>{
            console.log(err)
          })
        
    }, [])

    return <StyledAvatar alt={channel.name} src={avatarSrc} width={20}/>
}

export default SubscriptionAvatar