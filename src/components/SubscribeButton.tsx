import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSnackbar } from 'notistack'
import StyledButton from 'components/StyledButton'
import { selectMyName } from 'redux/slices/user'
import { setChannelData } from 'redux/slices/channel'
import { HiveApi } from 'services/HiveApi'
import { getLocalDB } from 'utils/db'

const SubscribeButton = (props) => {
  const { channel } = props
  const [isDoingSubscription, setIsDoingSubscription] = React.useState(false)
  const isSubscribed = channel['is_subscribed']
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar();
  const myName = useSelector(selectMyName)
  const hiveApi = new HiveApi()
  const LocalDB = getLocalDB()
  const feedsDid = localStorage.getItem('FEEDS_DID')
  const myDID = `did:elastos:${feedsDid}`

  const handleSubscription = (e) => {
    e.stopPropagation()
    setIsDoingSubscription(true)
    const currentTime = new Date().getTime()
    const channel_id = channel['channel_id']
    Promise.resolve()
      .then(async _=>{
        // const originDoc = { is_subscribed: isSubscribed, subscribers: [...(channel['subscribers'] || [])]}
        const updateDoc = { is_subscribed: !isSubscribed }
        if(!isSubscribed) {
          const newSubscriber = {
            channel_id,
            created_at: currentTime,
            display_name: myName,
            status: 0,
            updated_at: currentTime,
            user_did: myDID
          }
          updateDoc['subscribers'] = [...(channel['subscribers'] || []), newSubscriber]
        }
        else {
          if(channel['subscribers']) {
            const subscriberIndex = channel['subscribers'].findIndex(el=>el.user_did===myDID)
            if(subscriberIndex>=0) {
              updateDoc['subscribers'] = [...channel['subscribers']]
              updateDoc['subscribers'].splice(subscriberIndex, 1)
            }
          }
        }
        const updateObj = {}
        try {
          if(!isSubscribed) {
            await hiveApi.subscribeChannel(channel['target_did'], channel_id, myName, currentTime)
            await hiveApi.backupSubscribedChannel(channel['target_did'], channel_id)
          }
          else {
            await hiveApi.unSubscribeChannel(channel['target_did'], channel_id)
            await hiveApi.removeBackupData(channel['target_did'], channel_id)
          }
          updateObj[channel_id] = updateDoc
          dispatch(setChannelData(updateObj))
          return LocalDB.upsert(channel_id, (doc)=>{
            return {...doc, ...updateDoc}
          })
        } catch(err) {
          // updateObj[channel_id] = originDoc
          // dispatch(setChannelData(updateObj))
        }
      })
      .then(_=>{
        enqueueSnackbar(`${!isSubscribed? 'Subscribe': 'Unsubscribe'} channel success`, { variant: 'success' });
        setIsDoingSubscription(false)
      })
      .catch(err=>{
        enqueueSnackbar(`${!isSubscribed? 'Subscribe': 'Unsubscribe'} channel error`, { variant: 'error' });
        setIsDoingSubscription(false)
      })
  }
  return (
    <StyledButton 
      size='small' 
      type={isSubscribed? "contained": "outlined"} 
      loading={isDoingSubscription} 
      needLoading={true} 
      onClick={handleSubscription}
    >
      {isSubscribed? "Subscribed": "Subscribe"}
    </StyledButton>
  )
}

export default SubscribeButton;
