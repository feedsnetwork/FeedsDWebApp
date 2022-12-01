import { getLocalDB, StepType } from "./db"
import { CommonStatus } from "models/common_content"
import { HiveApi } from "services/HiveApi"
import { CHANNEL_REG_CONTRACT_ABI } from 'abi/ChannelRegistry';
import { ChannelRegContractAddress } from 'config';
import { DefaultAvatarMap } from "./avatar_map";
import { setChannelData } from 'redux/slices/channel'
import { increaseLoadNum } from "redux/slices/post";
import { getAppPreference, LimitPostCount, getMinValueFromArray, getMergedArray, getFilteredArrayByUnique,
    encodeBase64, getWeb3Contract, getIpfsUrl, excludeFromArray, getInfoFromDID, compressImage } from "./common"
import { setUserInfo } from "redux/slices/user";
import { updatePublicStep, updateStep } from "redux/slices/proc";
const hiveApi = new HiveApi()

export const mainproc = (props) => {
    const { dispatch } = props
    const feedsDid = sessionStorage.getItem('FEEDS_DID')
    const myDID = `did:elastos:${feedsDid}`
    const LocalDB = getLocalDB()

    const updateQueryStep = (step, isPublic=false, isLocal=false)=>(
        new Promise((resolve, reject) => {
            const flagId = `query-${isPublic? 'public-': ''}step`
            const stepUpdateAction = isPublic? updatePublicStep: updateStep
            LocalDB.upsert(flagId, (doc)=>{
                const stepDoc = {...doc, step: step['index']}
                if(doc._id) {
                    dispatch(stepUpdateAction(step['name']))
                    if(doc['step'] < step['index'] && !isLocal) {
                        return stepDoc
                    }
                    return false
                }
                if(!isLocal) {
                    dispatch(stepUpdateAction(step['name']))
                    return stepDoc
                }
                return false
            })
                .then(resolve)
        })
    )
    const filterAvatar = async (avatarSrc)=>{
        let content = avatarSrc
        if(avatarSrc.startsWith('assets/images')) {
            const avatarSrcSplit = avatarSrc.split("/")
            const avatarFile = avatarSrcSplit[avatarSrcSplit.length-1]
            content = DefaultAvatarMap[avatarFile] || ""
        } else {
            content = await compressImage(avatarSrc)
        }
        return encodeBase64(content)
    }
    const createIndex = (selector)=>{
        return LocalDB.createIndex({
            index: { fields: Object.keys(selector) }
        })
    }
    const getChannelSelectorByType = (type) => {
        const selector = { 
            table_type: 'channel'
        }
        switch(type) {
            case 'self':
                selector['is_self'] = true
                break;
            case 'subscribed':
                selector['is_self'] = false
                selector['is_subscribed'] = true
                break;
            case 'public':
                selector['is_public'] = true
                break;
        }
        return selector
    }

    // functions to synchronize state value with browser db data
    const syncChannelData = (type, isLocal=false)=>{
        const selector = getChannelSelectorByType(type)
        const channelStepTypes = { self: StepType.self_channel, subscribed: StepType.subscribed_channel, public: StepType.public_channel }
        LocalDB.find({ selector })
            .then(response=>(
                dispatch(setChannelData({type, data: response.docs}))
            ))
            .then(_=>{
                updateQueryStep(channelStepTypes[type], type==='public', isLocal)
            })
    }
    
    // main process steps
    const querySelfChannelStep = () => (
        new Promise((resolve, reject) => {
            syncChannelData('self', true)
            hiveApi.querySelfChannels()
                .then(async res=>{
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
                        const junkDocs = selfChannelsInDB.docs
                            .filter(doc=>selfChannels.every(channel=>channel['channel_id']!==doc['channel_id']))
                            .map(originDoc=>(
                                LocalDB.upsert(originDoc._id, (doc)=>{
                                    doc['is_self'] = false
                                    return doc
                                })
                            ))
                        const selfChannelDocs = selfChannels.map(channel=>(
                            LocalDB.upsert(channel.channel_id, (doc)=>{
                                if(doc['modified'] === channel['modified']){
                                    if(!doc['is_self']) {
                                        doc['is_self'] = true
                                        return doc
                                    }
                                    return false
                                }
                                delete channel['_id']
                                if(doc._id) {
                                    const channelDoc = {...doc, ...channel, is_self: true}
                                    if(doc['avatar'] !== channel['avatar'])
                                        channelDoc['avatarSrc'] = ''
                                    return channelDoc
                                }
                                return {
                                    ...channel, 
                                    is_self: true, 
                                    is_subscribed: false, 
                                    is_public: false, 
                                    time_range: [], 
                                    display_name: channel['display_name'] || channel['name'],
                                    table_type: 'channel'
                                }
                            })
                        ))
                        Promise.all([...junkDocs, ...selfChannelDocs])
                            .then(_=>syncChannelData('self'))
                            .then(_=>{
                                queryDispNameStepEx('self')
                                queryChannelAvatarStepEx('self')
                                querySubscriptionInfoStepEx('self')
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
            syncChannelData('subscribed', true)
            hiveApi.queryBackupData()
                .then(async backupRes=>{
                    if(Array.isArray(backupRes)) {
                        const subscribedChannelsInDB = await LocalDB.find({
                            selector: {
                                table_type: 'channel',
                                is_subscribed: true
                            }
                        })
                        const subscribedChannelArr = getFilteredArrayByUnique(backupRes, "channel_id")
                        const junkDocs = subscribedChannelsInDB.docs
                            .filter(doc=>subscribedChannelArr.every(channel=>channel['channel_id']!==doc['channel_id']))
                            .map(originDoc=>(
                                LocalDB.upsert(originDoc._id, (doc)=>{
                                    doc['is_subscribed'] = false
                                    return doc
                                })
                            ))
                        const getChannelInfo = (channel):Promise<object> => (
                            new Promise((resolve, reject)=>{
                                hiveApi.queryChannelInfo(channel.target_did, channel.channel_id)
                                    .then(response => {
                                        if(response['find_message'] && response['find_message']['items'].length) {
                                            resolve(response['find_message']['items'][0])
                                            return
                                        }
                                        reject(new Error())
                                    })
                                    .catch(reject)
                            })
                        )
                        const subscribedChannelDocs = subscribedChannelArr.map(async channel=>{
                            try {
                                const originDoc = await LocalDB.get(channel.channel_id)
                                if(originDoc['is_self']) {
                                    return await LocalDB.upsert(originDoc._id, (doc)=>{
                                        if(!doc['is_subscribed']){
                                            doc['is_subscribed'] = true
                                            return doc
                                        }
                                        return false
                                    })
                                }
                                try {
                                    const channelInfo = await getChannelInfo(channel)
                                    return await LocalDB.upsert(originDoc._id, (doc)=>{
                                        if(doc['modified'] === channelInfo['modified']) {
                                            if(!doc['is_subscribed']){
                                                doc['is_subscribed'] = true
                                                return doc
                                            }
                                            return false
                                        }
                                        let channelDoc = {...doc, ...channelInfo, is_subscribed: true, _id: doc._id}
                                        if(doc['avatar'] !== channelInfo['avatar'])
                                            channelDoc['avatarSrc'] = ''
                                        return channelDoc 
                                    })
                                } catch(e) {
                                    return {success: false, error: e}
                                }
                            } catch(err) {
                                try {
                                    const channelInfo = await getChannelInfo(channel)
                                    return await LocalDB.upsert(channel.channel_id, ()=>{
                                        return {
                                            ...channelInfo, 
                                            target_did: channel.target_did,
                                            is_self: false, 
                                            is_subscribed: true, 
                                            is_public: false, 
                                            time_range: [], 
                                            table_type: 'channel',
                                            display_name: channelInfo['display_name'] || channelInfo['name']
                                        }
                                    })
                                } catch(e) {
                                    return {success: false, error: e}
                                }
                            }
                        })
                        Promise.all([...junkDocs, ...subscribedChannelDocs])
                            .then(_=>syncChannelData('subscribed'))
                            .then(_=>{ 
                                queryDispNameStepEx('subscribed')
                                queryChannelAvatarStepEx('subscribed')
                                querySubscriptionInfoStepEx('subscribed')
                                resolve({success: true})
                            })
                            .catch(err=>{
                                resolve({success: false, error: err})
                            })
                    }
                    else
                        resolve({success: true})
                    }
                )
                .catch(err=>{
                    reject(err)
                })
        })
    )

    const queryPostStep = (is_public=false) => (
        new Promise((resolve, reject) => {
            const prefConf = getAppPreference()
            const selector = { table_type: 'channel', is_public }
            createIndex(selector)
                .then(_=>LocalDB.find({ selector }))
                .then(response=>{
                    const postsByChannel = response.docs.map(async channel=>{
                        try {
                            let prevTimeRange = [...channel['time_range']]
                            const lastime = prevTimeRange.length? prevTimeRange[0].end: 0
                            const currentime = new Date().getTime()
                            const queryApi = hiveApi.queryPostByRangeOfTime
                            const postRes = await queryApi(channel['target_did'], channel['channel_id'], lastime, currentime)
                            if(postRes['find_message'] && postRes['find_message']['items']) {
                                let postArr = postRes['find_message']['items']
                                const timeRangeObj = {start: lastime, end: currentime}
                                if(postArr.length >= LimitPostCount) {
                                    const earliestime = getMinValueFromArray(postArr, 'updated_at')
                                    timeRangeObj.start = earliestime
                                }
                                if(timeRangeObj.start === lastime && prevTimeRange.length)
                                    prevTimeRange[0].end = currentime
                                else
                                    prevTimeRange = [timeRangeObj, ...prevTimeRange]
                                LocalDB.upsert(channel._id, (doc)=>{
                                    doc['time_range'] = prevTimeRange
                                    return doc
                                })
                                if(prefConf.DP)
                                    postArr = postArr.filter(postItem=>postItem.status!==CommonStatus.deleted)
                                const postDocArr = postArr.map(post=>(
                                    LocalDB.upsert(post.post_id, (doc)=>{
                                        if(doc['modified'] === post['modified'])
                                            return false
                                        delete post['_id']
                                        if(doc._id) {
                                            const postDoc = {...doc, ...post, mediaData: []}
                                            if(typeof post.created === 'object')
                                                postDoc.created = new Date(post.created['$date']).getTime()/1000
                                            return postDoc
                                        }
                                        const postDoc = {
                                            ...post,
                                            target_did: channel['target_did'],
                                            table_type: 'post',
                                            likes: 0,
                                            like_me: false,
                                            like_creators: [],
                                            mediaData: [],
                                        }
                                        if(typeof post.created === 'object')
                                            postDoc.created = new Date(post.created['$date']).getTime()/1000
                                        return postDoc
                                    })
                                ))
                                return postDocArr
                            }
                        } catch(err) {}
                        return []
                    })
                    Promise.all(postsByChannel)
                        .then(postGroup=>Promise.all(getMergedArray(postGroup)))
                        .then(_=>updateQueryStep(StepType.post_data, is_public))
                        .then(_=>resolve({success: true}))
                        .catch(err=>resolve({success: false, error: err}))
                })
                .catch(err=>reject(err))
        })
    )
    
    const queryPostLikeStep = (is_public=false) => (
        new Promise((resolve, reject) => {
            const selector = { table_type: 'channel', is_public }
            createIndex(selector)
                .then(_=>LocalDB.find({ selector }))
                .then(response=>{
                    const postDocsByChannel = response.docs.map(async channel=>{
                        const postSelector = { table_type: 'post', channel_id: channel['channel_id'] }
                        const postResponse = await LocalDB.find({ selector: postSelector })
                        const postDocWithLikeInfo = postResponse.docs.map(post=>(
                            new Promise((resolveDoc, rejectDoc)=>{
                                hiveApi.queryLikeById(post['target_did'], post['channel_id'], post['post_id'], '0')
                                    .then(likeRes=>(
                                        LocalDB.upsert(post._id, (doc)=>{
                                            if(likeRes['find_message'] && likeRes['find_message']['items']) {
                                                const likeArr = likeRes['find_message']['items']
                                                const filteredLikeArr = getFilteredArrayByUnique(likeArr, 'creater_did')
                                                const likeCreators = filteredLikeArr.map(item=>item.creater_did)
                                                doc['likes'] = filteredLikeArr.length
                                                doc['like_me'] = likeCreators.includes(myDID)
                                                doc['like_creators'] = likeCreators
                                                return doc
                                            }
                                            return false
                                        })
                                    ))
                                    .then(resolveDoc)
                                    .catch(err=>resolveDoc({success: false, error: err}))
                            })
                        ))
                        return postDocWithLikeInfo
                    })
                    Promise.all(postDocsByChannel)
                        .then(postGroup=>Promise.all(getMergedArray(postGroup)))
                        .then(_=>updateQueryStep(StepType.post_like, is_public))
                        .then(_=>resolve({success: true}))
                        .catch(err=>resolve({success: false, error: err}))
                })
                .catch(err=>{
                    reject(err)
                })
            })
    )

    const queryPostImgStep = (is_public=false) => (
        new Promise((resolve, reject) => {
            const selector = { table_type: 'channel', is_public }
            createIndex(selector)
                .then(_=>LocalDB.find({ selector }))
                .then(response=>{
                    const postDocsByChannel = response.docs.map(async channel=>{
                        const postSelector = { table_type: 'post', channel_id: channel['channel_id'] }
                        const postResponse = await LocalDB.find({ selector: postSelector })
                        const postDocWithImg = postResponse.docs.map(async post=>{
                            if(post['status'] !== CommonStatus.deleted) {
                                try {
                                    const contentObj = JSON.parse(post['content'])
                                    const mediaThumbnailData = contentObj.mediaData.filter(media=>!!media.thumbnailPath).map(async media => {
                                        const mediaObj = {...media}
                                        try {
                                            const mediaSrc = await hiveApi.downloadScripting(post['target_did'], media.originMediaPath)
                                            if(mediaSrc) {
                                                mediaObj['thumbnailSrc'] = mediaSrc
                                                return mediaObj
                                            }
                                        } catch(err) {
                                            console.log(err)
                                        }
                                        return null
                                    })
                                    const mediaOriginData = contentObj.mediaData.filter(media=>!!media.originMediaPath).map(async media => {
                                        const mediaObj = {...media}
                                        try {
                                            const mediaSrc = await hiveApi.downloadScripting(post['target_did'], media.originMediaPath)
                                            if(mediaSrc) {
                                                mediaObj['mediaSrc'] = mediaSrc
                                                return mediaObj
                                            }
                                        } catch(err) {
                                            console.log(err)
                                        }
                                        return null
                                    })
                                    const mediaDataRes = await Promise.all([...mediaThumbnailData, ...mediaOriginData])
                                    const mediaData = mediaDataRes.filter(item=>!!item).reduce((mediaDataArr, item)=>{
                                        if(!mediaDataArr.length)
                                            mediaDataArr.push(item)
                                        else {
                                            const mediaIndex = mediaDataArr.findIndex(media=>media['originMediaPath']===item['originMediaPath'])
                                            if(mediaIndex>=0)
                                                mediaDataArr[mediaIndex] = {...mediaDataArr[mediaIndex], ...item}
                                            else
                                                mediaDataArr.push(item)
                                        }
                                        return mediaDataArr
                                    }, [])
                                    return await LocalDB.upsert(post._id, (doc)=>{
                                        doc['mediaData'] = mediaData
                                        return doc
                                    })
                                } catch(err) {}
                            }
                            return false
                        })
                        return postDocWithImg
                    })
                    Promise.all(postDocsByChannel)
                        .then(postGroup=>Promise.all(getMergedArray(postGroup)))
                        .then(_=>updateQueryStep(StepType.post_like, is_public))
                        .then(_=>resolve({success: true}))
                        .catch(err=>resolve({success: false, error: err}))
                })
                .catch(err=>{
                    reject(err)
                })
        })
    )

    const queryCommentStep = (is_public=false) => (
        new Promise((resolve, reject) => {
            const selector = { table_type: 'channel', is_public }
            createIndex(selector)
                .then(_=>LocalDB.find({ selector }))
                .then(response=>{
                    const postDocsByChannel = response.docs.map(channel=>(
                        new Promise((resolveDoc, rejectDoc)=>{
                            const postSelector = { table_type: 'post', channel_id: channel['channel_id'] }
                            LocalDB.find({ selector: postSelector })
                                .then(postResponse=>{
                                    const postIds = postResponse.docs.map(doc=>doc['post_id'])
                                    return hiveApi.queryCommentsFromPosts(channel['target_did'], channel['channel_id'], postIds)
                                })
                                .then(commentRes=>{
                                    if(commentRes['find_message'] && commentRes['find_message']['items']) {
                                        const commentDocs = commentRes['find_message']['items'].map(comment=>(
                                            LocalDB.upsert(comment.comment_id, (doc)=>{
                                                if(comment['updated_at'] === doc['updated_at'])
                                                    return false
                                                delete comment['_id']
                                                if(doc._id)
                                                    return {...doc, ...comment}
                                                const commentDoc = {
                                                    ...comment, 
                                                    target_did: channel['target_did'], 
                                                    table_type: 'comment',
                                                    likes: 0,
                                                    like_me: false,
                                                    like_creators: []
                                                }
                                                return commentDoc
                                            })
                                        ))
                                        return commentDocs
                                    }
                                    return []
                                })
                                .then(resolveDoc)
                                .catch(_=>resolveDoc([]))
                        })
                    ))
                    Promise.all(postDocsByChannel)
                        .then(commentGroup=>Promise.all(getMergedArray(commentGroup)))
                        .then(_=>updateQueryStep(StepType.comment_data, is_public))
                        .then(_=>resolve({success: true}))
                        .catch(err=>resolve({success: false, error: err}))
                })
                .catch(err=>{
                    reject(err)
                })
        })
    )

    const queryCommentLikeStep = (is_public=false) => (
        new Promise((resolve, reject) => {
            const selector = { table_type: 'channel', is_public }
            createIndex(selector)
                .then(_=>LocalDB.find({ selector }))
                .then(response=>{
                    const commentDocsByChannel = response.docs.map(async channel=>{
                        const commentSelector = { table_type: 'comment', channel_id: channel['channel_id'] }
                        const commentResponse = await LocalDB.find({ selector: commentSelector })
                        const commentDocWithLikeInfo = commentResponse.docs.map(comment=>(
                            new Promise((resolveDoc, rejectDoc)=>{
                                hiveApi.queryLikeById(comment['target_did'], comment['channel_id'], comment['post_id'], comment['comment_id'])
                                    .then(likeRes=>(
                                        LocalDB.upsert(comment._id, (doc)=>{
                                            if(likeRes['find_message'] && likeRes['find_message']['items']) {
                                                const likeArr = likeRes['find_message']['items']
                                                const filteredLikeArr = getFilteredArrayByUnique(likeArr, 'creater_did')
                                                const likeCreators = filteredLikeArr.map(item=>item.creater_did)
                                                doc['likes'] = filteredLikeArr.length
                                                doc['like_me'] = likeCreators.includes(myDID)
                                                doc['like_creators'] = likeCreators
                                                return doc
                                            }
                                            return false
                                        })
                                    ))
                                    .then(resolveDoc)
                                    .catch(err=>resolveDoc({success: false, error: err}))
                            })
                        ))
                        return commentDocWithLikeInfo
                    })
                    Promise.all(commentDocsByChannel)
                        .then(commentGroup=>Promise.all(getMergedArray(commentGroup)))
                        .then(_=>updateQueryStep(StepType.comment_like, is_public))
                        .then(_=>resolve({success: true}))
                        .catch(err=>resolve({success: false, error: err}))
                })
                .catch(err=>{
                    reject(err)
                })
        })
    )

    // public process steps
    const queryPublicChannelStep = () => (
        new Promise((resolve, reject) => {
            syncChannelData('public', true)
            const startChannelIndex = 0, pageLimit = 0
            const channelRegContract = getWeb3Contract(CHANNEL_REG_CONTRACT_ABI, ChannelRegContractAddress, false)
            channelRegContract.methods.channelIds(startChannelIndex, pageLimit).call()
                .then(res=>{
                    if(!Array.isArray(res))
                        return []
                    const publicChannelObjs = res.map(async tokenId=>{
                        const channelInfo = await channelRegContract.methods.channelInfo(tokenId).call()
                        const metaUri = getIpfsUrl(channelInfo['tokenURI'])
                        if(!channelInfo['channelEntry'] || !metaUri)
                            return null
                        const splitEntry = channelInfo['channelEntry'].split('/')
                        if(splitEntry.length<2)
                            return null

                        const targetDid = splitEntry[splitEntry.length - 2]
                        const channelId = splitEntry[splitEntry.length - 1]
                        const metaRes = await fetch(metaUri)
                        const metaContent = await metaRes.json()
                        return {
                            channel_id: channelId,
                            name: metaContent.name,
                            display_name: metaContent?.data?.cname || metaContent.name,
                            intro: metaContent.description,
                            target_did: targetDid, 
                            type: metaContent.type,
                            tipping_address: channelInfo['receiptAddr'],
                            is_public: true,
                            time_range: [], 
                            avatarSrc: getIpfsUrl(metaContent?.data?.avatar),
                            bannerSrc: getIpfsUrl(metaContent?.data?.banner),
                            table_type: 'channel',
                            tokenId
                        } 
                    })
                    Promise.all(publicChannelObjs)
                        .then(async publicChannels=>{
                            const publicChannelsInDB = await LocalDB.find({
                                selector: {
                                    table_type: 'channel',
                                    is_public: true
                                }
                            })
                            const junkDocs = publicChannelsInDB.docs
                                .filter(doc=>publicChannels.every(channel=>channel['channel_id']!==doc['channel_id']))
                                .map(originDoc=>(
                                    LocalDB.upsert(originDoc._id, (doc)=>{
                                        doc['is_public'] = false
                                        return doc
                                    })
                                ))
                            const publicChannelDocs = publicChannels.map(channel=>(
                                LocalDB.upsert(channel['channel_id'], (doc)=>{
                                    if(doc._id) {
                                        if(!doc['is_public']){
                                            doc['is_public'] = true
                                            doc['tokenId'] = channel.tokenId
                                            return doc
                                        }
                                        return false
                                    }
                                    return {...doc, ...channel}
                                })
                            ))
                            return Promise.all([...junkDocs, ...publicChannelDocs])
                        })
                        .then(_=>syncChannelData('public'))
                        .then(_=>{
                            queryDispNameStepEx('public')
                            querySubscriptionInfoStepEx('public')
                            resolve({success: true})
                        })
                        .catch(err=>{
                            resolve({success: false, error: err})
                        })
                })
        })
    )
    const queryPublicPostStep = () => queryPostStep(true)
    const queryPublicPostLikeStep = () => queryPostLikeStep(true)
    const queryPublicPostImgStep = () => queryPostImgStep(true)
    const queryPublicCommentStep = () => queryCommentStep(true)
    const queryPublicCommentLikeStep = () => queryCommentLikeStep(true)
    
    // async steps
    const queryDispNameStepEx = (type) => {
        const selector = getChannelSelectorByType(type)
        createIndex(selector)
            .then(_=>LocalDB.find({ selector }))
            .then(response=>{
                const channelDocNoOwnerName = response.docs.filter(doc=>!doc['owner_name'])
                channelDocNoOwnerName.forEach(channel=>{
                    const c_id = channel['channel_id']
                    const dispNameObj = {}
                    Promise.resolve()
                        .then(_=>hiveApi.queryUserDisplayName(channel['target_did'], channel['channel_id'], channel['target_did']))
                        .then(res=>{
                            if(res['find_message'] && res['find_message']['items'].length) {
                                const dispName = res['find_message']['items'][0].display_name
                                dispNameObj[c_id] = {owner_name: dispName}
                                LocalDB.upsert(channel._id, (doc)=>{
                                    doc['owner_name'] = dispName
                                    return doc
                                })
                                    .then(_=>{
                                        dispatch(setChannelData({type, data: dispNameObj}))
                                    })
                            }
                        })
                        .catch(err=>{})
                })
            })
    }
    const queryChannelAvatarStepEx = (type) => {
        const selector = getChannelSelectorByType(type)
        createIndex(selector)
            .then(_=>LocalDB.find({ selector }))
            .then(response=>{
                const channelDocNoAvatar = response.docs.filter(doc=>!doc['avatarSrc'])
                channelDocNoAvatar.forEach(channel=>{
                    if(channel['is_self']) {
                        const parseAvatar = channel['avatar'].split('@')
                        const avatarObj = {}
                        Promise.resolve()
                            .then(_=>hiveApi.downloadCustomeAvatar(parseAvatar[parseAvatar.length-1]))
                            .then(avatarRes=>{
                                if(avatarRes && avatarRes.length) {
                                    const avatarSrc = avatarRes.reduce((content, code)=>{
                                        content=`${content}${String.fromCharCode(code)}`;
                                        return content
                                    }, '')
                                    return filterAvatar(avatarSrc)
                                }
                                return ''
                            })
                            .then(avatarSrc=>{
                                avatarObj[channel._id] = { avatarSrc }
                                LocalDB.upsert(channel._id, (doc)=>{
                                    doc['avatarSrc'] = avatarObj[channel._id].avatarSrc
                                    return doc
                                })
                                    .then(_=>dispatch(setChannelData({type, data: avatarObj})))
                            })
                    }
                    else {
                        const avatarObj = {}
                        Promise.resolve()
                            .then(_=>hiveApi.downloadScripting(channel['target_did'], channel['avatar']))
                            .then(avatarRes=>{
                                avatarObj[channel._id] = { avatarSrc: filterAvatar(avatarRes) }
                                LocalDB.upsert(channel._id, (doc)=>{
                                    doc['avatarSrc'] = avatarObj[channel._id].avatarSrc
                                    return doc
                                })
                                    .then(_=>dispatch(setChannelData({type, data: avatarObj})))
                            })
                    }
                })
            })
            .catch(err=>{})
    }
    const querySubscriptionInfoStepEx = (type) => {
        const selector = getChannelSelectorByType(type)
        createIndex(selector)
            .then(_=>LocalDB.find({ selector }))
            .then(response=>{
                const channelDocs = response.docs.map(channel=>(
                    new Promise((resolve, reject)=>{
                        const c_id = channel['channel_id']
                        const subscribersObj = {}
                        hiveApi.querySubscriptionInfoByChannelId(channel['target_did'], channel['channel_id'])
                            .then(res=>{
                                if(res['find_message']) {
                                    let subscribersArr = res['find_message']['items']
                                    subscribersArr = getFilteredArrayByUnique(subscribersArr, 'user_did')
                                    subscribersObj[c_id] = { subscribers: subscribersArr }
                                    LocalDB.upsert(channel._id, (doc)=>{
                                        doc['subscribers'] = subscribersArr
                                        return doc
                                    })
                                        .then(_=>dispatch(setChannelData({type, data: subscribersObj})))
                                    return subscribersArr
                                }
                                return []
                            })
                            .then(resolve)
                            .catch(err=>resolve([]))
                    })
                ))
                return Promise.all(channelDocs)
            })
            .then(async subscriptionGroup=>{
                let subscriberArr = getMergedArray(subscriptionGroup)
                subscriberArr = getFilteredArrayByUnique(subscriberArr, 'user_did')
                const userDataResponse = await LocalDB.find({ selector: {table_type: 'user'} })
                const userDataDocs = userDataResponse.docs
                dispatch(setUserInfo(userDataDocs))
                // query user info
                const queriedDIDs = userDataDocs.map(doc=>doc._id)
                subscriberArr = excludeFromArray(subscriberArr, queriedDIDs, 'user_did')
                const userDocs = subscriberArr.map(async subscriber=>{
                    const user_did = subscriber['user_did']
                    let infoDoc = {
                        user_did, 
                        name: subscriber['display_name'], 
                        table_type: 'user'
                    }
                    try {
                        const userInfo = await getInfoFromDID(user_did)
                        infoDoc = {...infoDoc, ...userInfo as object}
                    } catch(err) {}
                    await LocalDB.upsert(user_did, (doc)=>{
                        return {...doc, ...infoDoc}
                    })
                    return infoDoc
                })
                const userInfoArr = await Promise.all(userDocs)
                dispatch(setUserInfo(userInfoArr.filter(item=>item!==null)))
                // query user avatar
                const queriedDIDsWithoutAvatar = userDataDocs.filter(doc=>!doc['avatarSrc']).map(doc=>doc._id)
                const userDocsWithAvatar = [...queriedDIDsWithoutAvatar, ...subscriberArr].map(userDID=>(
                    new Promise((resolve, reject)=>{
                        const avatarObj = {}
                        hiveApi.getHiveUrl(userDID)
                            // .then(hiveUrl=>hiveApi.downloadFileByHiveUrl(userDID, hiveUrl))
                            // .then(res=>{
                            //     const resBuf = res as Buffer
                            //     if(resBuf && resBuf.length) {
                            //         const base64Content = resBuf.toString('base64')
                            //         avatarObj[userDID] = { avatarSrc: encodeBase64(`data:image/png;base64,${base64Content}`) }
                            //         LocalDB.upsert(userDID, (doc)=>{
                            //             if(doc._id) {
                            //                 return {...doc, ...avatarObj[userDID]}
                            //             }
                            //             return false
                            //         })
                            //         dispatch(setUserInfo(avatarObj))
                            //     }
                            //     return
                            // })
                            .then(resolve)
                            .catch(err=>{})
                    })
                ))
                Promise.all(userDocsWithAvatar)
            })
    }

    const querySteps = [
        querySelfChannelStep, 
        querySubscribedChannelStep, 
        queryPostStep,
        queryPostLikeStep,
        // queryPostImgStep,
        queryCommentStep,
        queryCommentLikeStep
    ]
    const queryPublicSteps = [
        queryPublicChannelStep,
        queryPublicPostStep,
        queryPublicPostLikeStep,
        // queryPublicPostImgStep,
        queryPublicCommentStep,
        queryPublicCommentLikeStep
    ]
    return { querySteps, queryPublicSteps }
}

export const nextproc = (props) => {
    const { dispatch } = props
    const feedsDid = sessionStorage.getItem('FEEDS_DID')
    const myDID = `did:elastos:${feedsDid}`
    const LocalDB = getLocalDB()

    const queryPostNextStep = (channelId) => (
        new Promise((resolve, reject) => {
            const prefConf = getAppPreference()
            LocalDB.get(channelId)
                .then(async channelDoc=>{
                    let prevTimeRange = channelDoc['time_range']
                    const lastStart = prevTimeRange[0]?.start || 0
                    const nextEnd = prevTimeRange[1]?.end || 0
                    const queryApi = hiveApi.queryPostByRangeOfTime
                    const postRes = await queryApi(channelDoc['target_did'], channelDoc['channel_id'], nextEnd, lastStart)
                    if(postRes['find_message'] && postRes['find_message']['items']) {
                        let postArr = postRes['find_message']['items']
                        if(postArr.length >= LimitPostCount) {
                            const earliestime = getMinValueFromArray(postArr, 'updated_at')
                            prevTimeRange[0].start = earliestime
                        }
                        else {
                            prevTimeRange[0].start = prevTimeRange[1]?.start || 0
                            prevTimeRange.splice(1, 1)
                        }
                        LocalDB.upsert(channelId, (doc)=>{
                            doc['time_range'] = prevTimeRange
                            return doc
                        })
                        if(prefConf.DP)
                            postArr = postArr.filter(postItem=>postItem.status!==CommonStatus.deleted)
                        let nextPostDocs = postArr.map(post=>{
                            const tempost = {...post}
                            tempost._id = post.post_id
                            tempost.target_did = channelDoc['target_did']
                            tempost.table_type = 'post'
                            tempost.likes = 0
                            tempost.like_me = false
                            tempost.like_creators = []
                            tempost.mediaData = []
                            if(typeof post.created === 'object')
                                tempost.created = new Date(post.created['$date']).getTime()/1000
                            return tempost
                        })
                        await LocalDB.bulkDocs(nextPostDocs)
                        dispatch(increaseLoadNum())
                        resolve({success: true, data: nextPostDocs})
                        return
                    }
                    resolve({success: false, data: []})
                })
                .catch(err=>{
                    reject(err)
                })
        })
    )
    const queryPostLikeNextStep = (nextPostDocs) => (
        new Promise((resolve, reject) => {
            const postDocWithLikeInfo = nextPostDocs.map(post=>(
                new Promise((resolveDoc, rejectDoc)=>{
                    hiveApi.queryLikeById(post['target_did'], post['channel_id'], post['post_id'], '0')
                        .then(likeRes=>(
                            LocalDB.upsert(post._id, (doc)=>{
                                if(likeRes['find_message'] && likeRes['find_message']['items']) {
                                    const likeArr = likeRes['find_message']['items']
                                    const filteredLikeArr = getFilteredArrayByUnique(likeArr, 'creater_did')
                                    const likeCreators = filteredLikeArr.map(item=>item.creater_did)
                                    doc['likes'] = filteredLikeArr.length
                                    doc['like_me'] = likeCreators.includes(myDID)
                                    doc['like_creators'] = likeCreators
                                    return doc
                                }
                                return false
                            })
                        ))
                        .then(resolveDoc)
                        .catch(err=>resolveDoc({success: false, error: err}))
                })
            ))
            Promise.all(postDocWithLikeInfo)
                .then(_=>{
                    dispatch(increaseLoadNum())
                    resolve({success: true, data: nextPostDocs})
                })
                .catch(err=>{
                    reject(err)
                })
        })
    )
    const queryPostImgNextStep = (nextPostDocs) => (
        new Promise((resolve, reject) => {
            const postDocWithImg = nextPostDocs.map(async post=>{
                if(post['status'] !== CommonStatus.deleted) {
                    try {
                        const contentObj = JSON.parse(post['content'])
                        const mediaData = contentObj.mediaData.filter(media=>!!media.originMediaPath)
                        if(mediaData.length) {
                            const mediaObjArr = mediaData.map(async media => {
                                const mediaObj = {...media}
                                try {
                                    const mediaSrc = await hiveApi.downloadScripting(post['target_did'], media.originMediaPath)
                                    if(mediaSrc) {
                                        mediaObj['mediaSrc'] = mediaSrc
                                    }
                                } catch(err) {}
                                return mediaObj
                            })
                            const mediaDataArr = await Promise.all(mediaObjArr)
                            return await LocalDB.upsert(post._id, (doc)=>{
                                doc['mediaData'] = mediaDataArr
                                return doc
                            })
                        }
                    } catch(err) {}
                }
                return false
            })
            Promise.all(postDocWithImg)
                .then(_=>{
                    dispatch(increaseLoadNum())
                    resolve({success: true, data: nextPostDocs})
                })
                .catch(err=>{
                    reject(err)
                })
        })
    )
    const queryCommentNextStep = (nextPostDocs) => (
        new Promise((resolve, reject) => {
            if(!nextPostDocs.length) {
                resolve({success: true, data: []})
                return
            }
            const postIds = nextPostDocs.map(doc=>doc['post_id'])
            const { target_did, channel_id } = nextPostDocs[0]
            hiveApi.queryCommentsFromPosts(target_did, channel_id, postIds)
                .then(commentRes=>{
                    if(commentRes['find_message'] && commentRes['find_message']['items']) {
                        const commentDocs = commentRes['find_message']['items'].map(comment=>(
                            {
                                ...comment, 
                                _id: comment.comment_id,
                                target_did: target_did, 
                                table_type: 'comment',
                                likes: 0,
                                like_me: false,
                                like_creators: []
                            }
                        ))
                        return commentDocs
                    }
                    return []
                })
                .then(async nextCommentDocs=>{
                    await LocalDB.bulkDocs(nextCommentDocs)
                    dispatch(increaseLoadNum())
                    resolve({success: true, data: nextCommentDocs})
                })
                .catch(err=>{
                    reject(err)
                })
        })
    )
    const queryCommentLikeNextStep = (nextCommentDocs) => (
        new Promise((resolve, reject) => {
            const commentDocWithLikeInfo = nextCommentDocs.map(comment=>(
                new Promise((resolveDoc, rejectDoc)=>{
                    hiveApi.queryLikeById(comment['target_did'], comment['channel_id'], comment['post_id'], comment['comment_id'])
                        .then(likeRes=>(
                            LocalDB.upsert(comment._id, (doc)=>{
                                if(likeRes['find_message'] && likeRes['find_message']['items']) {
                                    const likeArr = likeRes['find_message']['items']
                                    const filteredLikeArr = getFilteredArrayByUnique(likeArr, 'creater_did')
                                    const likeCreators = filteredLikeArr.map(item=>item.creater_did)
                                    doc['likes'] = filteredLikeArr.length
                                    doc['like_me'] = likeCreators.includes(myDID)
                                    doc['like_creators'] = likeCreators
                                    return doc
                                }
                                return false
                            })
                        ))
                        .then(resolveDoc)
                        .catch(err=>resolveDoc({success: false, error: err}))
                })
            ))
            Promise.all(commentDocWithLikeInfo)
                .then(_=>{
                    dispatch(increaseLoadNum())
                    resolve({success: true})
                })
                .catch(err=>{
                    reject(err)
                })
        })
    )
}