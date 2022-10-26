import { FC, ReactNode, useEffect, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import FadeIn from 'react-fade-in';
import { Box, alpha, lighten, useTheme, Hidden, Container, Stack } from '@mui/material';

import Sidebar from './Sidebar';
import SidebarChannel from './SidebarChannel';
import RightPanel from './RightPanel';
import Header from './Header';
import FloatingHeader from './FloatingHeader'
import { essentialsConnector, initConnectivitySDK } from 'content/signin/EssentialConnectivity';
import AddChannel from 'components/AddChannel';
import ChannelCreatedDlg from 'components/Modal/ChannelCreated'
import PublishChannelDlg from 'components/Modal/PublishChannel'
import { OverPageContext } from 'contexts/OverPageContext';
import { SidebarContext } from 'contexts/SidebarContext';
import { CommonStatus } from 'models/common_content'
import { HiveApi } from 'services/HiveApi'
import { setChannelAvatarSrc, setDispNameOfChannels } from 'redux/slices/channel'
import { setUserAvatarSrc } from 'redux/slices/user'
import { encodeBase64, isInAppBrowser, promiseSeries, getInfoFromDID, getFilteredArrayByUnique, getAppPreference, getMergedArray, sortByDate, getMinValueFromArray, LimitPostCount } from 'utils/common'
import { LocalDB, QueryStep } from 'utils/db'

interface SidebarLayoutProps {
  children?: ReactNode;
  maxWidth?: any;
}
const SidebarLayout: FC<SidebarLayoutProps> = (props) => {
  const { maxWidth=false } = props
  const {setWalletAddress, focusedChannelId, setQueryStep} = useContext(SidebarContext);
  const hiveApi = new HiveApi()
  const sessionLinkFlag = sessionStorage.getItem('FEEDS_LINK');
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const myDID = `did:elastos:${feedsDid}`
  const dispatch = useDispatch()
  // LocalDB.destroy()

  const querySelfChannelStep = () => (
    new Promise((resolve, reject) => {
      hiveApi.querySelfChannels()
        .then(async res=>{
          // console.log(res, '-----------self')
          if(Array.isArray(res)){
            const selfChannels = 
              res.filter(item=>item.status !== CommonStatus.deleted)
                .map(item=>{
                  item.target_did = myDID
                  return item
                })
            const selfChannelsInDB = await LocalDB.find({
              selector: {
                table_type: 'channel',
                is_self: true
              }
            })
            const selfChannelRevs = selfChannelsInDB.docs.reduce((revObj, doc)=>{
              revObj[doc._id] = doc._rev
              return revObj
            }, {})
            const selfChannelDoc = selfChannels.map(channel=>{
              const channelDoc = {...channel, _id: channel.channel_id.toString(), is_self: true, is_subscribed: false, is_public: false, time_range: [], table_type: 'channel'}
              if(selfChannelRevs[channel.channel_id])
                channelDoc['_rev'] = selfChannelRevs[channel.channel_id]
              return channelDoc
            })
            Promise.resolve()
              .then(_=>LocalDB.bulkDocs(selfChannelDoc))
              .then(_=>LocalDB.put({_id: 'query-step', step: QueryStep.self_channel}))
              .then(_=>{ 
                queryChannelAvatarStep()
                setQueryStep(QueryStep.self_channel) 
                resolve({success: true})
              })
              .catch(err=>{
                resolve({success: false, error: err})
              })
          }
          else
            resolve({success: true})
        })
        .catch(err=>{
          reject(err)
        })
    })
  )

  const querySubscribedChannelStep = () => (
    new Promise((resolve, reject) => {
      hiveApi.queryBackupData()
        .then(async backupRes=>{
          if(Array.isArray(backupRes)) {
            const subscribedChannelsInDB = await LocalDB.find({
              selector: {
                table_type: 'channel',
                is_subscribed: true
              }
            })
            const subscribedChannelRevs = subscribedChannelsInDB.docs.reduce((revObj, doc)=>{
              revObj[doc._id] = doc._rev
              return revObj
            }, {})
            const backupChannelDocs = backupRes.map(async channel=>{
              const channelInfoRes = await hiveApi.queryChannelInfo(channel.target_did, channel.channel_id)
              if(channelInfoRes['find_message'] && channelInfoRes['find_message']['items'].length) {
                const channelInfo = channelInfoRes['find_message']['items'][0]
                const channelDoc = {...channelInfo, _id: channel.channel_id.toString(), target_did: channel.target_did, is_self: false, is_subscribed: true, is_public: false, time_range: [], table_type: 'channel'}
                if(subscribedChannelRevs[channel.channel_id])
                  channelDoc['_rev'] = subscribedChannelRevs[channel.channel_id]
                return channelDoc
              }
            })
            Promise.all(backupChannelDocs)
              .then(subscribedChannels=>{
                const selfSubcribedChannels = subscribedChannels.filter(channel=>channel.target_did === myDID)
                const othersSubcribedChannels = subscribedChannels.filter(channel=>channel.target_did !== myDID)
                return Promise.resolve({self: selfSubcribedChannels, others: othersSubcribedChannels})
              })
              .then(subscribedChannelData => {
                const insertOtherChannelAction = LocalDB.bulkDocs(subscribedChannelData.others)
                const updateSelfChannelAction = subscribedChannelData.self.map(channelDoc=>(
                  new Promise((resolveSub, rejectSub)=>{
                    LocalDB.get(channelDoc.channel_id.toString())
                      .then(doc => resolveSub(LocalDB.put({ ...doc, is_subscribed: true })))
                      .catch(err => resolveSub(LocalDB.put(channelDoc)))
                  })
                ))
                return Promise.all([insertOtherChannelAction, ...updateSelfChannelAction])
              })
              .then(async _=>{
                const stepDoc = await LocalDB.get('query-step')
                return LocalDB.put({_id: 'query-step', step: QueryStep.subscribed_channel, _rev: stepDoc._rev})
              })
              .then(_=>{ 
                queryChannelAvatarStep()
                setQueryStep(QueryStep.subscribed_channel) 
                resolve({success: true})
              })
              .catch(err=>{
                resolve({success: false, error: err})
              })
          }
          else
            resolve({success: true})
        })
        .catch(err=>{
          reject(err)
        })
    })
  )

  const queryDispNameStep = () => (
    LocalDB.find({
      selector: {
        table_type: 'channel'
      },
    })
      .then(response=>{
        const channelWithOwnerName = response.docs.filter(doc=>!!doc['owner_name'])
        const channelDocNoOwnerName = response.docs.filter(doc=>!doc['owner_name'])
        const dispNameObjs = channelWithOwnerName.reduce((objs, channel) => {
          const c_id = channel['_id']
          objs[c_id] = channel['owner_name']
          return objs
        }, {})
        dispatch(setDispNameOfChannels(dispNameObjs))

        channelDocNoOwnerName.forEach(channel=>{
          let infoDoc = {...channel}
          const { _id } = infoDoc
          const dispNameObj = {}
          Promise.resolve()
            .then(_=>hiveApi.queryUserDisplayName(channel['target_did'], channel['channel_id'], channel['target_did']))
            .then(res=>{
              if(res['find_message'] && res['find_message']['items'].length) {
                const dispName = res['find_message']['items'][0].display_name
                infoDoc['owner_name'] = dispName
                dispNameObj[_id] = dispName
                return LocalDB.put(infoDoc)
              }
            })
            .then(res=>{
              dispatch(setDispNameOfChannels(dispNameObj))
            })
            .catch(err=>{})
        })
      })
  )

  const querySubscriptionInfoStep = () => (
    new Promise((resolve, reject) => {
      LocalDB.find({
        selector: {
          table_type: 'channel'
        },
      })
        .then(response=>{
          const channelDocWithSubcriptionInfo = response.docs.map(async channel=>{
            const subscriptionRes = await hiveApi.querySubscriptionInfoByChannelId(channel['target_did'], channel['channel_id'])
            const channelDoc = {...channel}
            if(subscriptionRes['find_message']) {
              const subscribersArr = subscriptionRes['find_message']['items']
              channelDoc['subscribers'] = subscribersArr
            }
            return channelDoc
          })
          Promise.all(channelDocWithSubcriptionInfo)
            .then(channelData => LocalDB.bulkDocs(channelData))
            .then(async _=>{
              const stepDoc = await LocalDB.get('query-step')
              return LocalDB.put({_id: 'query-step', step: QueryStep.subscription_info, _rev: stepDoc._rev})
            })
            .then(_=>{ 
              setQueryStep(QueryStep.subscription_info) 
              resolve({success: true})
            })
            .catch(err=>{
              resolve({success: false, error: err})
            })
        })
        .catch(err=>{
          reject(err)
        })
    })
  )
  
  const querySubscriberInfoStep = () => (
    new Promise((resolve, reject) => {
      LocalDB.find({
        selector: {
          table_type: 'channel'
        },
      })
        .then(response=>{
          let subscribers = response.docs.reduce((group, channel)=>{
            if(channel['subscribers'])
              group = [...group, ...channel['subscribers']]
            return group
          }, [])
          subscribers = getFilteredArrayByUnique(subscribers, 'user_did')
          const subscriberInfoDoc = 
            subscribers
              .filter(subscriber => subscriber.user_did !== myDID)
              .map(async subscriber => {
                let infoDoc = null
                try {
                  const userInfo = await getInfoFromDID(subscriber.user_did)
                  infoDoc = {...userInfo as object, _id: subscriber.user_did, table_type: 'user'}
                } catch(err) {}
                return infoDoc
              })
          Promise.all(subscriberInfoDoc)
            .then(userData => LocalDB.bulkDocs(userData.filter(item=>item!==null)))
            .then(async _=>{
              const stepDoc = await LocalDB.get('query-step')
              return LocalDB.put({_id: 'query-step', step: QueryStep.subscriber_info, _rev: stepDoc._rev})
            })
            .then(_=>{ 
              setQueryStep(QueryStep.subscriber_info) 
              resolve({success: true})
            })
            .catch(err=>{
              resolve({success: false, error: err})
            })
        })
        .catch(err=>{
          reject(err)
        })
    })
  )

  const queryPostStep = () => {
    queryUserAvatarStep()
    return new Promise((resolve, reject) => {
      const prefConf = getAppPreference()
      LocalDB.find({
        selector: {
          table_type: 'channel'
        },
      })
        .then(response=>{
          const postsByChannel = response.docs.map(async channel=>{
            try {
              const currentime = new Date().getTime()
              const postRes = await hiveApi.queryPostByRangeOfTime(channel['target_did'], channel['channel_id'], 0, currentime)
              if(postRes['find_message'] && postRes['find_message']['items']) {
                let postArr = postRes['find_message']['items']
                const timeRangeObj = {start: 0, end: currentime}
                if(postArr.length >= LimitPostCount) {
                  const earliestime = getMinValueFromArray(postArr, 'updated_at')
                  timeRangeObj.start = earliestime
                }
                LocalDB.put({...channel, time_range: [timeRangeObj]})
                if(prefConf.DP)
                  postArr = postArr.filter(postItem=>postItem.status!==CommonStatus.deleted)

                const postDocArr = postArr.map(post=>{
                  const tempost = {...post}
                  tempost._id = post.post_id
                  tempost.target_did = channel['target_did']
                  tempost.table_type = 'post'
                  tempost.is_in_favour = true
                  tempost.likes = 0
                  tempost.like_me = false
                  tempost.like_creators = []
                  tempost.mediaData = []
                  if(typeof post.created === 'object')
                    tempost.created = new Date(post.created['$date']).getTime()/1000
                  return tempost
                })
                return postDocArr
              }
            } catch(err) {}
            return []
          })
          Promise.all(postsByChannel)
            .then(postGroup=> Promise.resolve(getMergedArray(postGroup)))
            .then(postData => LocalDB.bulkDocs(postData))
            .then(async _=>{
              const stepDoc = await LocalDB.get('query-step')
              return LocalDB.put({_id: 'query-step', step: QueryStep.post_data, _rev: stepDoc._rev})
            })
            .then(_=>{ 
              setQueryStep(QueryStep.post_data) 
              resolve({success: true})
            })
            .catch(err=>{
              resolve({success: false, error: err})
            })
        })
        .catch(err=>{
          reject(err)
        })
    })
  }
  
  const queryLikeInfoStep = () => (
    new Promise((resolve, reject) => {
      LocalDB.find({
        selector: {
          table_type: 'post'
        },
      })
        .then(response=>{
          const postDocWithLikeInfo = response.docs.map(async post=>{
            const postDoc = {...post}
            try {
              const likeRes = await hiveApi.queryLikeById(post['target_did'], post['channel_id'], post['post_id'], '0')
              if(likeRes['find_message'] && likeRes['find_message']['items']) {
                const likeArr = likeRes['find_message']['items']
                const filteredLikeArr = getFilteredArrayByUnique(likeArr, 'creater_did')
                const likeCreators = filteredLikeArr.map(item=>item.creater_did)
                postDoc['likes'] = filteredLikeArr.length
                postDoc['like_me'] = likeCreators.includes(myDID)
                postDoc['like_creators'] = likeCreators
              }
            } catch(err) {}
            return postDoc
          })
          Promise.all(postDocWithLikeInfo)
            .then(postData => LocalDB.bulkDocs(postData))
            .then(async _=>{
              const stepDoc = await LocalDB.get('query-step')
              return LocalDB.put({_id: 'query-step', step: QueryStep.post_like, _rev: stepDoc._rev})
            })
            .then(_=>{ 
              setQueryStep(QueryStep.post_like) 
              resolve({success: true})
            })
            .catch(err=>{
              resolve({success: false, error: err})
            })
        })
        .catch(err=>{
          reject(err)
        })
    })
  )

  const queryPostImgStep = () => (
    new Promise((resolve, reject) => {
      LocalDB.find({
        selector: {
          table_type: 'post'
        },
      })
        .then(response=>{
          const postDocWithImg = response.docs.map(async post=>{
            const postDoc = {...post}
            if(post['status'] !== CommonStatus.deleted) {
              try {
                const contentObj = JSON.parse(post['content'])
                const mediaData = contentObj.mediaData.filter(media=>!!media.originMediaPath).map(async media => {
                  const mediaObj = {...media}
                  try {
                    const mediaSrc = await hiveApi.downloadScripting(post['target_did'], media.originMediaPath)
                    if(mediaSrc) {
                      mediaObj['mediaSrc'] = mediaSrc
                    }
                  } catch(err) {
                    console.log(err)
                  }
                  return mediaObj
                })
                postDoc['mediaData'] = await Promise.all(mediaData)
              } catch(err) {}
            }
            return postDoc
          })
          Promise.all(postDocWithImg)
            .then(postData => LocalDB.bulkDocs(postData))
            .then(async _=>{
              const stepDoc = await LocalDB.get('query-step')
              return LocalDB.put({_id: 'query-step', step: QueryStep.post_image, _rev: stepDoc._rev})
            })
            .then(_=>{ 
              setQueryStep(QueryStep.post_image) 
              resolve({success: true})
            })
            .catch(err=>{
              resolve({success: false, error: err})
            })
        })
        .catch(err=>{
          reject(err)
        })
    })
  )

  const queryCommentStep = () => (
    new Promise((resolve, reject) => {
      LocalDB.find({
        selector: {
          table_type: 'post'
        },
      })
        .then(response=>{
          var postGroup = response.docs.reduce((group, p) => {
            const {target_did=null, channel_id=null, post_id=null} = {...p}
            if(group.some(obj => obj['channel_id'] === channel_id)) {
              const gId = group.findIndex(obj => obj['channel_id'] === channel_id)
              group[gId]['postIds'].push(post_id)
            }
            else {
              group.push({target_did, channel_id, postIds: [post_id]})
            }
            return group;
          }, []);
          const commentsByPost = postGroup.map(async group => {
            const {target_did, channel_id, postIds} = group
            const commentRes = await hiveApi.queryCommentsFromPosts(target_did, channel_id, postIds)
            if(commentRes['find_message'] && commentRes['find_message']['items']) {
              const commentArr = commentRes['find_message']['items']
              const ascCommentArr = sortByDate(commentArr, 'asc')
              const linkedComments = ascCommentArr.reduce((res, item)=>{
                if(item.refcomment_id === '0' || !res.some((c) => c.comment_id === item.refcomment_id)) {
                  const commentDoc = {
                    ...item, 
                    _id: item.comment_id, 
                    target_did, 
                    table_type: 'comment',
                    likes: 0,
                    like_me: false,
                    like_creators: []
                  }
                  res.push(commentDoc)
                  return res
                }
                const tempRefIndex = res.findIndex((c) => c.comment_id === item.refcomment_id)
                if(res[tempRefIndex]['commentData'])
                  res[tempRefIndex]['commentData'].push(item)
                else res[tempRefIndex]['commentData'] = [item]
                return res
              }, []).reverse()
              return linkedComments
            }
            return []
          })
          Promise.all(commentsByPost)
            .then(commentGroup=> Promise.resolve(getMergedArray(commentGroup)))
            .then(commentData => LocalDB.bulkDocs(commentData))
            .then(async _=>{
              const stepDoc = await LocalDB.get('query-step')
              return LocalDB.put({_id: 'query-step', step: QueryStep.comment_data, _rev: stepDoc._rev})
            })
            .then(_=>{ 
              setQueryStep(QueryStep.comment_data) 
              resolve({success: true})
            })
            .catch(err=>{
              resolve({success: false, error: err})
            })
        })
        .catch(err=>{
          reject(err)
        })
    })
  )

  const queryCommentLikeStep = () => (
    new Promise((resolve, reject) => {
      LocalDB.find({
        selector: {
          table_type: 'comment'
        },
      })
        .then(response=>{
          const commentDocWithLikeInfo = response.docs.map(async comment=>{
            const commentDoc = {...comment}
            const {target_did=null, channel_id=null, post_id=null, comment_id=null} = {...comment}
            try {
              const likeRes = await hiveApi.queryLikeById(target_did, channel_id, post_id, comment_id)
              if(likeRes['find_message'] && likeRes['find_message']['items']) {
                const likeArr = likeRes['find_message']['items']
                const filteredLikeArr = getFilteredArrayByUnique(likeArr, 'creater_did')
                const likeCreators = filteredLikeArr.map(item=>item.creater_did)
                commentDoc['likes'] = filteredLikeArr.length
                commentDoc['like_me'] = likeCreators.includes(myDID)
                commentDoc['like_creators'] = likeCreators
              }
            } catch(err) {}
            return commentDoc
          })
          Promise.all(commentDocWithLikeInfo)
            .then(commentData => LocalDB.bulkDocs(commentData))
            .then(async _=>{
              const stepDoc = await LocalDB.get('query-step')
              return LocalDB.put({_id: 'query-step', step: QueryStep.comment_like, _rev: stepDoc._rev})
            })
            .then(_=>{ 
              setQueryStep(QueryStep.comment_like) 
              resolve({success: true})
            })
            .catch(err=>{
              resolve({success: false, error: err})
            })
        })
        .catch(err=>{
          reject(err)
        })
    })
  )

  const queryChannelAvatarStep = () => {
    LocalDB.find({
      selector: {
        table_type: 'channel'
      },
    })
      .then(response=>{
        const channelWithAvatar = response.docs.filter(doc=>!!doc['avatarSrc'])
        const channelDocNoAvatar = response.docs.filter(doc=>!doc['avatarSrc'])
        const avatarObjs = channelWithAvatar.reduce((objs, channel) => {
          const c_id = channel['channel_id']
          objs[c_id] = channel['avatarSrc']
          return objs
        }, {})
        dispatch(setChannelAvatarSrc(avatarObjs))

        channelDocNoAvatar.forEach(channel=>{
          let infoDoc = {...channel}
          if(channel['is_self']) {
            const parseAvatar = infoDoc['avatar'].split('@')
            Promise.resolve()
              .then(_=>hiveApi.downloadCustomeAvatar(parseAvatar[parseAvatar.length-1]))
              .then(avatarRes=>{
                if(avatarRes && avatarRes.length) {
                  const avatarObj = {}
                  const channel_id = infoDoc['channel_id']
                  const avatarSrc = avatarRes.reduce((content, code)=>{
                    content=`${content}${String.fromCharCode(code)}`;
                    return content
                  }, '')
                  infoDoc['avatarSrc'] = encodeBase64(avatarSrc)
                  LocalDB.put(infoDoc)
                  avatarObj[channel_id] = infoDoc['avatarSrc']
                  dispatch(setChannelAvatarSrc(avatarObj))
                }
              })
          }
          else {
            Promise.resolve()
              .then(_=>hiveApi.downloadScripting(infoDoc['target_did'], infoDoc['avatar']))
              .then(avatarRes=>{
                const avatarObj = {}
                const channel_id = infoDoc['channel_id']
                infoDoc['avatarSrc'] = encodeBase64(avatarRes)
                LocalDB.put(infoDoc)
                avatarObj[channel_id] = infoDoc['avatarSrc']
                dispatch(setChannelAvatarSrc(avatarObj))
              })
          }
        })
      })
      .catch(err=>{})
  }

  const queryUserAvatarStep = () => {
    LocalDB.find({
      selector: {
        table_type: 'user'
      },
    })
      .then(response=>{
        const subscriberWithAvatar = response.docs.filter(doc=>!!doc['avatarSrc'])
        const subscriberDocNoAvatar = response.docs.filter(doc=>!doc['avatarSrc'])
        const avatarObjs = subscriberWithAvatar.reduce((objs, subscriber) => {
          const s_did = subscriber['_id']
          objs[s_did] = subscriber['avatarSrc']
          return objs
        }, {})
        dispatch(setUserAvatarSrc(avatarObjs))

        subscriberDocNoAvatar.forEach(subscriber=>{
          let infoDoc = {...subscriber}
          const { _id } = infoDoc
          const avatarObj = {}
          Promise.resolve()
            .then(_=>hiveApi.getHiveUrl(infoDoc['_id']))
            .then(hiveUrl=>hiveApi.downloadFileByHiveUrl(infoDoc['_id'], hiveUrl))
            .then(res=>{
              const resBuf = res as Buffer
              if(resBuf && resBuf.length) {
                const base64Content = resBuf.toString('base64')
                infoDoc['avatarSrc'] = encodeBase64(`data:image/png;base64,${base64Content}`)
                avatarObj[_id] = infoDoc['avatarSrc']
                return LocalDB.put(infoDoc)
              }
            })
            .then(res=>{
              dispatch(setUserAvatarSrc(avatarObj))
            })
            .catch(err=>{})
        })
      })
      .catch(err=>{})
  }

  const querySteps = [
    querySelfChannelStep, 
    querySubscribedChannelStep, 
    querySubscriptionInfoStep, 
    querySubscriberInfoStep, 
    queryPostStep,
    queryLikeInfoStep,
    queryPostImgStep,
    queryCommentStep,
    queryCommentLikeStep
  ]

  useEffect(()=>{
    LocalDB.createIndex({
      index: {
        fields: ['table_type', 'is_self', 'is_subscribed', 'is_public', 'created_at'],
      }
    }).then(()=>{
      LocalDB.get('query-step')
        .then(currentStep=>{
          setQueryStep(currentStep['step'])
          const remainedSteps = querySteps.slice(currentStep['step']).map(func=>func())
          Promise.all(remainedSteps)
            .then(res=>{
              console.log(res, "---result")
            })
          if(currentStep['step'] >= QueryStep.subscribed_channel) {
            queryChannelAvatarStep()
            queryDispNameStep()
          }
          if(currentStep['step'] > QueryStep.post_data)
            queryUserAvatarStep()
        })
        .catch(err=>{
          promiseSeries(querySteps)
            .then(res=>{
              console.log(res)
            })
        })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initializeWalletConnection = () => {
    if (sessionLinkFlag === '1') {
      setWalletAddress(
        isInAppBrowser()
          ? window['elastos'].getWeb3Provider().address
          : essentialsConnector.getWalletConnectProvider().wc.accounts[0]
      );
    }
  };
  if (sessionLinkFlag === '1') {
    initConnectivitySDK(initializeWalletConnection)
  }

  const { pageType } = useContext(OverPageContext);
  const { pathname } = useLocation();
  const theme = useTheme();

  let floatingHeaderVisible = false;
  if(
    ((pathname==='/home' || pathname==='/channel') && pageType==='AddChannel')
    || (pathname.startsWith('/channel') && focusedChannelId)
    || pathname.startsWith('/subscription/channel')
    || pathname.startsWith('/explore/channel')
    || pathname.startsWith('/setting')
    || pathname.startsWith('/post/')
    || pathname==='/profile'
  )
    floatingHeaderVisible = true;

  const addChannelVisible = (pathname==='/home' || pathname==='/channel') && pageType==='AddChannel'
  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',

        '.MuiPageTitle-wrapper': {
          background:
            theme.palette.mode === 'dark'
              ? theme.colors.alpha.trueWhite[5]
              : theme.colors.alpha.white[50],
          marginBottom: `${theme.spacing(4)}`,
          boxShadow:
            theme.palette.mode === 'dark'
              ? `0 1px 0 ${alpha(
                  lighten(theme.colors.primary.main, 0.7),
                  0.15
                )}, 0px 2px 4px -3px rgba(0, 0, 0, 0.2), 0px 5px 12px -4px rgba(0, 0, 0, .1)`
              : `0px 2px 4px -3px ${alpha(
                  theme.colors.alpha.black[100],
                  0.1
                )}, 0px 5px 12px -4px ${alpha(
                  theme.colors.alpha.black[100],
                  0.05
                )}`
        }
      }}
    >
      <Hidden lgUp>
        <Header />
      </Hidden>
      <Stack direction='row' sx={{height: '100%'}}>
        <SidebarChannel />
        <Sidebar />
        <Box
          sx={{
            position: 'relative',
            zIndex: 5,
            display: 'block',
            flex: 1,
            pt: `${theme.header.height}`,
            minHeight: '100%',
            background: theme.colors.default.main,
            overflow: 'hidden',
            [theme.breakpoints.up('lg')]: {
              pt: 0,
            }
          }}
        >
          {
            floatingHeaderVisible &&
            <FloatingHeader/>
          }
          {
              addChannelVisible?
              <Box sx={{ overflow: 'auto', height: (theme)=>`calc(100% - ${theme.header.height})` }}>
                <FadeIn>
                  <AddChannel/>
                </FadeIn>
              </Box>:

              <Box id="scrollableBox" sx={{ overflow: 'auto', height: (theme)=>floatingHeaderVisible?`calc(100% - ${theme.header.height})`:'100%' }}>
                <Container sx={{ flexGrow: 1, overFlow: 'auto', p: '0px !important', height: '100%' }} maxWidth={maxWidth}>
                  <Outlet />
                </Container>
              </Box>
          }
        </Box>
        {
          !(pathname === '/explore' || pathname === '/explore/') &&
          <RightPanel />
        }
      </Stack>
      <ChannelCreatedDlg/>
      <PublishChannelDlg/>
    </Box>
  );
};

export default SidebarLayout;
