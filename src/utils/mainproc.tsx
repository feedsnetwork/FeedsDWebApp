import { getLocalDB, QueryStep } from "./db"
import { CommonStatus } from "models/common_content"
import { HiveApi } from "services/HiveApi"
import { CHANNEL_REG_CONTRACT_ABI } from 'abi/ChannelRegistry';
import { ChannelRegContractAddress } from 'config';
import { DefaultAvatarMap } from "./avatar_map";
import { setChannelAvatarSrc, setDispNameOfChannels, setSubscribers } from 'redux/slices/channel'
import { increaseLoadNum } from "redux/slices/post";
import { getAppPreference, LimitPostCount, getMinValueFromArray, getMergedArray, getFilteredArrayByUnique,
    encodeBase64, getWeb3Contract, getIpfsUrl } from "./common"
const hiveApi = new HiveApi()

export const getTableType = (type, isPublic=false) => (isPublic? `public-${type}`: type)
export const getDocId = (itemId, isPublic=false) => (isPublic? `p-${itemId}`: itemId)

export const mainproc = (props) => {
    const { dispatch, setQueryStep, setQueryPublicStep, setQueryFlag, setQueryPublicFlag } = props
    const feedsDid = sessionStorage.getItem('FEEDS_DID')
    const myDID = `did:elastos:${feedsDid}`
    const LocalDB = getLocalDB()

    const updateStepFlag = (step, isPublic=false)=>(
        new Promise((resolve, reject) => {
            const flagId = `query-${isPublic? 'public-': ''}step`
            const queryStepSetter = isPublic? setQueryPublicStep: setQueryStep
            const queryUpdateSetter = isPublic? setQueryPublicFlag: setQueryFlag
            LocalDB.get(flagId)
                .then(stepDoc => {
                    if(stepDoc['step'] < step)
                        LocalDB.put({_id: flagId, step, _rev: stepDoc._rev})
                            .then(res=>{
                                queryStepSetter(step)
                                resolve(res)
                            })
                    else
                        queryUpdateSetter(step)
                        resolve({})
                    }
                )
                .catch(err => {
                    LocalDB.put({_id: flagId, step})
                        .then(res=>{
                            queryStepSetter(step)
                            resolve(res)
                        })
                    }
                )
        })
    )
    const filterAvatar = (avatarSrc)=>{
        let content = avatarSrc
        if(avatarSrc.startsWith('assets/images')) {
            const avatarSrcSplit = avatarSrc.split("/")
            const avatarFile = avatarSrcSplit[avatarSrcSplit.length-1]
            content = DefaultAvatarMap[avatarFile] || ""
        }
        return encodeBase64(content)
    }
    const createIndex = (selector)=>{
        return LocalDB.createIndex({
            index: { fields: Object.keys(selector) }
        })
    }

    // main process steps
    const querySelfChannelStep = () => (
        new Promise((resolve, reject) => {
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
                            .then(_=>updateStepFlag(QueryStep.self_channel))
                            .then(_=>{
                                queryDispNameStep()
                                queryChannelAvatarStep()
                                querySubscriptionInfoStep() 
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
                            .then(_=>updateStepFlag(QueryStep.subscribed_channel))
                            .then(_=>{ 
                                queryDispNameStep()
                                queryChannelAvatarStep()
                                querySubscriptionInfoStep()
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
                        .then(_=>updateStepFlag(QueryStep.post_data, is_public))
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
                        .then(_=>updateStepFlag(QueryStep.post_like, is_public))
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
                                    const mediaDataArr = await Promise.all(mediaData)
                                    return await LocalDB.upsert(post._id, (doc)=>{
                                        if(!mediaData.length)
                                            return false
                                        doc['mediaData'] = mediaDataArr
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
                        .then(_=>updateStepFlag(QueryStep.post_image, true))
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
                        .then(_=>updateStepFlag(QueryStep.comment_data, is_public))
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
                        .then(_=>updateStepFlag(QueryStep.comment_like, is_public))
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
                        .then(_=>updateStepFlag(QueryStep.public_channel, true))
                        .then(_=>{
                            queryDispNameStep(true)
                            querySubscriptionInfoStep(true)
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
    const queryDispNameStep = (is_public=false) => {
        const selector = { table_type: 'channel', is_public }
        createIndex(selector)
            .then(_=>LocalDB.find({ selector }))
            .then(response=>{
                const channelWithOwnerName = response.docs.filter(doc=>!!doc['owner_name'])
                const channelDocNoOwnerName = response.docs.filter(doc=>!doc['owner_name'])
                const dispNameObjs = channelWithOwnerName.reduce((objs, channel) => {
                    const c_id = channel['channel_id']
                    objs[c_id] = channel['owner_name']
                    return objs
                }, {})
                dispatch(setDispNameOfChannels(dispNameObjs))

                channelDocNoOwnerName.forEach(channel=>{
                    const c_id = channel['channel_id']
                    const dispNameObj = {}
                    Promise.resolve()
                        .then(_=>hiveApi.queryUserDisplayName(channel['target_did'], channel['channel_id'], channel['target_did']))
                        .then(res=>{
                            if(res['find_message'] && res['find_message']['items'].length) {
                                const dispName = res['find_message']['items'][0].display_name
                                dispNameObj[c_id] = dispName
                                return LocalDB.upsert(channel._id, (doc)=>{
                                    doc['owner_name'] = dispName
                                    return doc
                                })
                            }
                        })
                        .then(_=>dispatch(setDispNameOfChannels(dispNameObj)))
                        .catch(err=>{})
                })
            })
    }

    const queryChannelAvatarStep = () => {
        const selector = { table_type: 'channel' }
        createIndex(selector)
            .then(_=>LocalDB.find({ selector }))
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
                                    avatarObj[channel._id] = filterAvatar(avatarSrc)
                                    return LocalDB.upsert(channel._id, (doc)=>{
                                        doc['avatarSrc'] = avatarObj[channel._id]
                                        return doc
                                    })
                                }
                            })
                            .then(_=>dispatch(setChannelAvatarSrc(avatarObj)))
                    }
                    else {
                        const avatarObj = {}
                        Promise.resolve()
                            .then(_=>hiveApi.downloadScripting(channel['target_did'], channel['avatar']))
                            .then(avatarRes=>{
                                avatarObj[channel._id] = filterAvatar(avatarRes)
                                return LocalDB.upsert(channel._id, (doc)=>{
                                    doc['avatarSrc'] = avatarObj[channel._id]
                                    return doc
                                })
                            })
                            .then(_=>dispatch(setChannelAvatarSrc(avatarObj)))
                    }
                })
            })
            .catch(err=>{})
    }

    const querySubscriptionInfoStep = (is_public=false) => {
        const selector = { table_type: 'channel', is_public }
        createIndex(selector)
            .then(_=>LocalDB.find({ selector }))
            .then(response=>{
                const channelWithSubscribers = response.docs.filter(doc=>!!doc['subscribers'])
                const subscribersObj = channelWithSubscribers.reduce((obj, channel) => {
                    const c_id = channel['channel_id']
                    obj[c_id] = channel['subscribers']
                    return obj
                }, {})
                dispatch(setSubscribers(subscribersObj))
                response.docs.forEach(channel=>{
                    const c_id = channel['channel_id']
                    const subscribersObj = {}
                    Promise.resolve()
                        .then(_=>hiveApi.querySubscriptionInfoByChannelId(channel['target_did'], channel['channel_id']))
                        .then(res=>{
                            if(res['find_message']) {
                                const subscribersArr = res['find_message']['items']
                                subscribersObj[c_id] = getFilteredArrayByUnique(subscribersArr, 'user_did')
                                return LocalDB.upsert(channel._id, (doc)=>{
                                    doc['subscribers'] = subscribersObj[c_id]
                                    return doc
                                })
                            }
                        })
                        .then(_=>dispatch(setSubscribers(subscribersObj)))
                        .catch(err=>{})
                })
            })
    }

    const querySteps = [
        querySelfChannelStep, 
        querySubscribedChannelStep, 
        queryPostStep,
        queryPostLikeStep,
        queryPostImgStep,
        queryCommentStep,
        queryCommentLikeStep
    ]
    const queryPublicSteps = [
        queryPublicChannelStep,
        queryPublicPostStep,
        queryPublicPostLikeStep,
        queryPublicPostImgStep,
        queryPublicCommentStep,
        queryPublicCommentLikeStep
    ]
    const asyncSteps = {
        queryDispNameStep, 
        queryChannelAvatarStep, 
        querySubscriptionInfoStep,
    }
    return { querySteps, queryPublicSteps, asyncSteps }
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