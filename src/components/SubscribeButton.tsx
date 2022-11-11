import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSnackbar } from 'notistack'
import StyledButton from 'components/StyledButton'
import { SidebarContext } from 'contexts/SidebarContext'
import { selectMyInfo } from 'redux/slices/user'
import { setSubscribers } from 'redux/slices/channel'
import { HiveApi } from 'services/HiveApi'
import { getLocalDB } from 'utils/db'

const SubscribeButton = (props) => {
  const { channel } = props
  const { increaseUpdatingChannelNumber } = React.useContext(SidebarContext);
  const [isDoingSubscription, setIsDoingSubscription] = React.useState(false)
  const isSubscribed = channel['is_subscribed']
  const dispatch = useDispatch()
  const { enqueueSnackbar } = useSnackbar();
  const myInfo = useSelector(selectMyInfo)
  const hiveApi = new HiveApi()
  const LocalDB = getLocalDB()
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const myDID = `did:elastos:${feedsDid}`

  const handleSubscription = () => {
    setIsDoingSubscription(true)
    const currentTime = new Date().getTime()
    const channel_id = channel['channel_id']
    Promise.resolve()
      .then(_=>{
        if(!isSubscribed)
          return hiveApi.subscribeChannel(channel['target_did'], channel_id, myInfo['name'], currentTime)
        else
          return hiveApi.unSubscribeChannel(channel['target_did'], channel_id)
      })
      .then(res=>LocalDB.get(channel._id))
      .then(doc=>{
        const updatedDoc = {...doc, is_subscribed: !isSubscribed}
        if(!isSubscribed) {
          const newSubscriber = {
            channel_id,
            created_at: currentTime,
            display_name: myInfo['name'],
            status: 0,
            updated_at: currentTime,
            user_did: myDID
          }
          if(updatedDoc['subscribers'])
            updatedDoc['subscribers'].push(newSubscriber)
          else updatedDoc['subscribers'] = [newSubscriber]
        }
        else {
          if(updatedDoc['subscribers']) {
            const subscriberIndex = updatedDoc['subscribers'].findIndex(el=>el.user_did===myDID)
            if(subscriberIndex>=0)
              updatedDoc['subscribers'].splice(subscriberIndex, 1)
          }
        }
        const subscriberObj = {}
        subscriberObj[channel_id] = updatedDoc['subscribers']
        dispatch(setSubscribers(subscriberObj))
        LocalDB.put(updatedDoc)
      })
      .then(res=>{
        increaseUpdatingChannelNumber()
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
