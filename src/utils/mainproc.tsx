import { getLocalDB, QueryStep } from "./db"
import { CommonStatus } from "models/common_content"
import { HiveApi } from "services/HiveApi"
import { CHANNEL_REG_CONTRACT_ABI } from 'abi/ChannelRegistry';
import { ChannelRegContractAddress } from 'config';
import { DefaultAvatarMap } from "./avatar_map";
import { setChannelAvatarSrc, setDispNameOfChannels, setSubscribers } from 'redux/slices/channel'
import { increaseLoadNum } from "redux/slices/post";
import { getAppPreference, LimitPostCount, getMinValueFromArray, getMergedArray, getFilteredArrayByUnique,
    sortByDate, encodeBase64, getWeb3Contract, getIpfsUrl } from "./common"
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
                        let selfChannelDoc = []
                        const originSelfChannels = [...selfChannelsInDB.docs]
                        selfChannels.forEach(channel=>{
                            let channelDoc = {}
                            const channelIndex = originSelfChannels.findIndex(doc=>doc['channel_id'] === channel.channel_id)
                            if(channelIndex>=0) {
                                const originChannel = originSelfChannels[channelIndex]
                                if(originChannel['modified'] === channel['modified'])
                                    channelDoc = originChannel
                                else {
                                    channelDoc = {...originChannel, ...channel, _id: originChannel._id}
                                    if(originChannel['avatar'] !== channel['avatar'])
                                        channelDoc['avatarSrc'] = ''
                                }
                                originSelfChannels.splice(channelIndex, 1)
                            }
                            else {
                                channelDoc = {
                                    ...channel, 
                                    _id: channel.channel_id.toString(),
                                    is_self: true, 
                                    is_subscribed: false, 
                                    time_range: [], 
                                    table_type: 'channel'
                                }
                            }
                            channelDoc['display_name'] = channelDoc['display_name'] || channelDoc['name']
                            selfChannelDoc.push(channelDoc)
                        })
                        const deleteDocs = originSelfChannels.map(item=>({...item, _deleted: true}))
                        Promise.resolve()
                            .then(_=>LocalDB.bulkDocs(deleteDocs))
                            .then(_=>LocalDB.bulkDocs(selfChannelDoc))
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
                                table_type: 'channel'
                            }
                        })
                        const originSubscribedChannels = [...subscribedChannelsInDB.docs]
                        const subscribedChannelArr = getFilteredArrayByUnique(backupRes, "channel_id")
                        const subscribedChannelDocs = subscribedChannelArr.map(async channel=>{
                            const channelIndex = originSubscribedChannels.findIndex(doc=>doc['channel_id'] === channel.channel_id)
                            if(channelIndex>=0) {
                                const originChannel = originSubscribedChannels[channelIndex]
                                if(originChannel['is_self']){
                                    await LocalDB.put({...originChannel, is_subscribed: true})
                                    return null
                                }
                            }
                            const channelInfoRes = await hiveApi.queryChannelInfo(channel.target_did, channel.channel_id)
                            if(channelInfoRes['find_message'] && channelInfoRes['find_message']['items'].length){
                                let channelDoc = {}
                                const channelInfo = channelInfoRes['find_message']['items'][0] 
                                if(channelIndex>=0) {
                                    const originChannel = originSubscribedChannels[channelIndex]
                                    if(originChannel['modified'] === channelInfo['modified'])
                                        channelDoc = {...originChannel, is_subscribed: true}
                                    else {
                                        channelDoc = {...originChannel, ...channelInfo, is_subscribed: true, _id: originChannel._id}
                                        if(originChannel['avatar'] !== channelInfo['avatar'])
                                            channelDoc['avatarSrc'] = ''
                                    }
                                    channelDoc['display_name'] = channelDoc['display_name'] || channelDoc['name']
                                    originSubscribedChannels.splice(channelIndex, 1)
                                    await LocalDB.put(channelDoc)
                                }
                                else {
                                    channelDoc = {
                                        ...channelInfo, 
                                        _id: channel.channel_id,
                                        target_did: channel.target_did,
                                        is_self: false, 
                                        is_subscribed: true, 
                                        time_range: [], 
                                        table_type: 'channel',
                                        display_name: channelInfo['display_name'] || channelInfo['name']
                                    }
                                    return channelDoc
                                }
                            }
                            return null
                        })
                        const deleteDocs = originSubscribedChannels.filter(channel=>!channel['is_self']).map(item=>({...item, _deleted: true}))
                        Promise.all(subscribedChannelDocs)
                            .then(subscribedChannels=>LocalDB.bulkDocs(subscribedChannels.filter(channel=>!!channel)))
                            .then(_=>LocalDB.bulkDocs(deleteDocs))
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

    const queryPostStep = (isPublic=false) => (
        new Promise((resolve, reject) => {
            const prefConf = getAppPreference()
            const table_type = getTableType('channel', isPublic)
            LocalDB.find({ selector: { table_type } })
                .then(response=>{
                    const postsByChannel = response.docs.map(async channel=>{
                        try {
                            let prevTimeRange = [...channel['time_range']]
                            const lastime = prevTimeRange.length? prevTimeRange[0].end: 0
                            const currentime = new Date().getTime()
                            const queryApi = isPublic? hiveApi.queryPublicPostRangeOfTime: hiveApi.queryPostByRangeOfTime
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
                                LocalDB.get(channel._id)
                                    .then(doc=>LocalDB.put({...doc, time_range: prevTimeRange}))
                                if(prefConf.DP)
                                    postArr = postArr.filter(postItem=>postItem.status!==CommonStatus.deleted)

                                const postDocArr = postArr.map(post=>{
                                    const tempost = {...post}
                                    tempost._id = getDocId(post.post_id, isPublic)
                                    tempost.target_did = channel['target_did']
                                    tempost.table_type = getTableType('post', isPublic) 
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
                        .then(_=>updateStepFlag(QueryStep.post_data, isPublic))
                        .then(_=>{ 
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
    
    const queryLikeInfoStep = (isPublic=false) => (
        new Promise((resolve, reject) => {
            const table_type = getTableType('post', isPublic)
            LocalDB.find({ selector: { table_type } })
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
                        .then(_=>updateStepFlag(QueryStep.post_like, isPublic))
                        .then(_=>{ 
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

    const queryPostImgStep = (isPublic=false) => (
        new Promise((resolve, reject) => {
            const table_type = getTableType('post', isPublic)
            LocalDB.find({ selector: { table_type } })
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
                        .then(_=>updateStepFlag(QueryStep.post_image, true))
                        .then(_=>{ 
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

    const queryCommentStep = (isPublic=false) => (
        new Promise((resolve, reject) => {
            const table_type = getTableType('post', isPublic)
            LocalDB.find({ selector: { table_type } })
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
                                        _id: getDocId(item.comment_id, isPublic), 
                                        target_did, 
                                        table_type: getTableType('comment', isPublic),
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
                        .then(commentGroup=>Promise.resolve(getMergedArray(commentGroup)))
                        .then(commentData =>LocalDB.bulkDocs(commentData))
                        .then(_=>updateStepFlag(QueryStep.comment_data, isPublic))
                        .then(_=>{ 
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

    const queryCommentLikeStep = (isPublic=false) => (
        new Promise((resolve, reject) => {
            const table_type = getTableType('comment', isPublic)
            LocalDB.find({ selector: { table_type } })
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
                        .then(commentData =>LocalDB.bulkDocs(commentData))
                        .then(_=>updateStepFlag(QueryStep.comment_like, isPublic))
                        .then(_=>{ 
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

    // public process steps
    const queryPublicChannelStep = () => (
        new Promise((resolve, reject) => {
            const startChannelIndex = 0, pageLimit = 0
            const channelRegContract = getWeb3Contract(CHANNEL_REG_CONTRACT_ABI, ChannelRegContractAddress, false)
            channelRegContract.methods.channelIds(startChannelIndex, pageLimit).call()
                .then(res=>{
                    if(!Array.isArray(res))
                        return
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
                        const channelDoc = {
                            _id: getDocId(channelId, true), 
                            type: metaContent.type,
                            name: metaContent.name,
                            intro: metaContent.description,
                            channel_id: channelId,
                            target_did: targetDid, 
                            time_range: [], 
                            avatarSrc: getIpfsUrl(metaContent?.data?.avatar),
                            bannerSrc: getIpfsUrl(metaContent?.data?.banner),
                            table_type: getTableType('channel', true),
                            display_name: metaContent?.data?.cname || metaContent.name,
                            tokenId
                        }
                        return channelDoc
                    })
                    Promise.all(publicChannelObjs)
                        .then(publicChannels=>{
                            const publicChannelDocs = publicChannels.filter(channel=>!!channel)
                            const storePublicChannels = new Promise((resolveSub, rejectSub)=>{
                                LocalDB.find({ selector: { table_type: getTableType('channel', true) } })
                                    .then(res=>{
                                        const deleteDocs = res.docs.map(item=>({...item, _deleted: true}))
                                        publicChannelDocs.forEach(channel=>{
                                            const channelIndex = deleteDocs.findIndex(doc=>doc['channel_id'] === channel.channel_id)
                                            if(channelIndex>=0)
                                                deleteDocs.splice(channelIndex, 1)
                                        })
                                        return LocalDB.bulkDocs(deleteDocs)
                                    })
                                    .then(res=>{
                                        const putPublicChannelAction = publicChannelDocs.map(channelDoc=>(
                                            new Promise((resolveSub, rejectSub)=>{
                                                LocalDB.get(channelDoc._id)
                                                    .then(doc => resolveSub(LocalDB.put({...channelDoc, _rev: doc._rev})))
                                                    .catch(err => resolveSub(LocalDB.put(channelDoc)))
                                            })
                                        ))
                                        return Promise.all(putPublicChannelAction)
                                    })
                                    .then(resolveSub)
                                    .catch(resolveSub)
                            })
                            return storePublicChannels
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
    const queryPublicLikeInfoStep = () => queryLikeInfoStep(true)
    const queryPublicPostImgStep = () => queryPostImgStep(true)
    const queryPublicCommentStep = () => queryCommentStep(true)
    const queryPublicCommentLikeStep = () => queryCommentLikeStep(true)
    
    // async steps
    const queryDispNameStep = (isPublic=false) => {
        const table_type = getTableType('channel', isPublic)
        LocalDB.find({ selector: { table_type } })
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
                                return LocalDB.get(channel._id)
                            }
                        })
                        .then(doc=>{
                            const infoDoc = {...doc, owner_name: dispNameObj[c_id]}
                            return LocalDB.put(infoDoc)
                        })
                        .then(res=>{
                            dispatch(setDispNameOfChannels(dispNameObj))
                        })
                        .catch(err=>{})
                })
            })
    }

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
                                    return LocalDB.get(channel._id)
                                }
                            })
                            .then(doc=>{
                                const infoDoc = {...doc, avatarSrc: avatarObj[channel._id]}
                                LocalDB.put(infoDoc)
                                dispatch(setChannelAvatarSrc(avatarObj))
                            })
                    }
                    else {
                        const avatarObj = {}
                        Promise.resolve()
                            .then(_=>hiveApi.downloadScripting(channel['target_did'], channel['avatar']))
                            .then(avatarRes=>{
                                avatarObj[channel._id] = filterAvatar(avatarRes)
                                return LocalDB.get(channel._id)
                            })
                            .then(doc=>{
                                const infoDoc = {...doc, avatarSrc: avatarObj[channel._id]}
                                LocalDB.put(infoDoc)
                                dispatch(setChannelAvatarSrc(avatarObj))
                            })
                    }
                })
            })
            .catch(err=>{})
    }

    const querySubscriptionInfoStep = (isPublic=false) => {
        const table_type = getTableType('channel', isPublic)
        LocalDB.find({ selector: { table_type } })
            .then(response=>{
                const channelWithSubscribers = response.docs.filter(doc=>!!doc['subscribers'])
                // const channelDocNoSubscribers = response.docs.filter(doc=>!doc['subscribers'])
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
                                subscribersObj[c_id] = subscribersArr
                                return LocalDB.get(channel._id)
                            }
                        })
                        .then(doc=>{
                            const infoDoc = {...doc, subscribers: subscribersObj[c_id]}
                            LocalDB.put(infoDoc)
                            dispatch(setSubscribers(subscribersObj))
                        })
                        .catch(err=>{})
                })
            })
    }

    const querySteps = [
        querySelfChannelStep, 
        querySubscribedChannelStep, 
        queryPostStep,
        queryLikeInfoStep,
        queryPostImgStep,
        queryCommentStep,
        queryCommentLikeStep
    ]
    const queryPublicSteps = [
        queryPublicChannelStep,
        queryPublicPostStep,
        queryPublicLikeInfoStep,
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

    const queryPostNextStep = (channelId, isPublic=false) => (
        new Promise((resolve, reject) => {
            const prefConf = getAppPreference()
            let nextPostDocs = []
            let channelDoc = {}
            LocalDB.get(getDocId(channelId, isPublic))
                .then(doc=>{
                    channelDoc = {...doc}
                    const lastStart = channelDoc['time_range'][0]?.start || 0
                    const nextEnd = channelDoc['time_range'][1]?.end || 0
                    const queryApi = isPublic? hiveApi.queryPublicPostRangeOfTime: hiveApi.queryPostByRangeOfTime
                    return queryApi(doc['target_did'], doc['channel_id'], nextEnd, lastStart)
                })
                .then(postRes=>{
                    if(postRes['find_message'] && postRes['find_message']['items']) {
                        let prevTimeRange = channelDoc['time_range']
                        let postArr = postRes['find_message']['items']
                        if(postArr.length >= LimitPostCount) {
                            const earliestime = getMinValueFromArray(postArr, 'updated_at')
                            prevTimeRange[0].start = earliestime
                        }
                        else {
                            prevTimeRange[0].start = prevTimeRange[1]?.start || 0
                            prevTimeRange.splice(1, 1)
                        }
                        if(prefConf.DP)
                            postArr = postArr.filter(postItem=>postItem.status!==CommonStatus.deleted)
                        nextPostDocs = postArr.map(post=>{
                            const tempost = {...post}
                            tempost._id = getDocId(post.post_id, isPublic)
                            tempost.target_did = channelDoc['target_did']
                            tempost.table_type = getTableType('post', isPublic) 
                            tempost.likes = 0
                            tempost.like_me = false
                            tempost.like_creators = []
                            tempost.mediaData = []
                            tempost.is_new=true
                            if(typeof post.created === 'object')
                                tempost.created = new Date(post.created['$date']).getTime()/1000
                            return tempost
                        })
                        return LocalDB.put(channelDoc)
                    }
                    resolve({success: false, data: []})
                })
                .then(_=>LocalDB.bulkDocs(nextPostDocs))
                .then(_=>{
                    dispatch(increaseLoadNum())
                    resolve({success: true, data: nextPostDocs})
                })
                .catch(err=>{
                    reject(err)
                })
        })
    )
    const queryLikeInfoNextStep = (nextPostDocs, isPublic=false) => (
        new Promise((resolve, reject) => {
            const postDocWithLikeInfo = nextPostDocs.map(async post=>{
                try {
                    const postDoc = await LocalDB.get(getDocId(post.post_id, isPublic))
                    const likeRes = await hiveApi.queryLikeById(post['target_did'], post['channel_id'], post['post_id'], '0')
                    if(likeRes['find_message'] && likeRes['find_message']['items']) {
                        const likeArr = likeRes['find_message']['items']
                        const filteredLikeArr = getFilteredArrayByUnique(likeArr, 'creater_did')
                        const likeCreators = filteredLikeArr.map(item=>item.creater_did)
                        postDoc['likes'] = filteredLikeArr.length
                        postDoc['like_me'] = likeCreators.includes(myDID)
                        postDoc['like_creators'] = likeCreators
                        await LocalDB.put(postDoc)
                    }
                    return postDoc
                } catch(err) {}
                return post
            })
            Promise.all(postDocWithLikeInfo)
                .then(postDocs => {
                    dispatch(increaseLoadNum())
                    resolve({success: true, data: postDocs})
                })
                .catch(err=>{
                    reject(err)
                })
        })
    )
    const queryPostImgNextStep = (nextPostDocs, isPublic=false) => (
        new Promise((resolve, reject) => {
            const postDocWithImg = nextPostDocs.map(async post=>{
                if(post['status'] !== CommonStatus.deleted) {
                    try {
                        const postDoc = await LocalDB.get(getDocId(post.post_id, isPublic))
                        const contentObj = JSON.parse(postDoc['content'])
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
                            postDoc['mediaData'] = await Promise.all(mediaObjArr)
                            await LocalDB.put(postDoc)
                        }
                        return postDoc
                    } catch(err) {}
                }
                return post
            })
            Promise.all(postDocWithImg)
                .then(postDocs => {
                    dispatch(increaseLoadNum())
                    resolve({success: true, data: postDocs})
                })
                .catch(err=>{
                    reject(err)
                })
        })
    )
}