import { DID, DIDBackend, DefaultDIDAdapter } from '@elastosfoundation/did-js-sdk';
import { formatDistance } from 'date-fns';
import { createHash } from 'crypto';
import Autolinker from 'autolinker';
import { HiveApi } from 'src/services/HiveApi'
import { CommonStatus } from 'src/models/common_content'

export const reduceDIDstring = (strDID) => {
  if(!strDID)
    return ''

  if((strDID.match(/:/g) || []).length !== 2){
    if(strDID.length<10)
      return strDID
    return `${strDID.substring(0, 6)}...${strDID.substring(strDID.length - 3, strDID.length)}`;
  }

  const prefix = strDID.split(':', 2).join(':');
  if (prefix.length >= strDID.length)
    return strDID;
  const tempDID = strDID.substring(prefix.length + 1);
  if(tempDID.length<10)
    return strDID
  return prefix+`:${tempDID.substring(0, 6)}...${tempDID.substring(tempDID.length - 3, tempDID.length)}`;
}

export const reduceHexAddress = (strAddress) => {
  if(!strAddress)
    return ''
  if(strAddress.length<10)
    return strAddress
  return `${strAddress.substring(0, 6)}...${strAddress.substring(strAddress.length - 3, strAddress.length)}`;
}

export const SettingMenuArray = [
  {to: '/profile', name: 'Account Info', description: 'Profile and verifiable credentials (DID) details'},
  {to: '/credentials', name: 'Credentials', description: 'Manage user profile and verifiable credentials visibility'},
  {to: '/language', name: 'Language', description: 'Global language settings'},
  {to: '/api', name: 'API Provider', description: 'Configure API provider'},
  {to: '/preferences', name: 'App Preferences', description: 'Manage app preferences'},
  {to: '/connections', name: 'Connections', description: 'Manage account connections'},
  {to: '/about', name: 'About Feeds', description: 'Feeds Network basic information'},
]

export const isInAppBrowser = () => window['elastos'] !== undefined && window['elastos'].name === 'essentialsiab';

export const getInfoFromDID = (did) =>
  new Promise((resolve, reject) => {
    if(!DIDBackend.isInitialized())
      DIDBackend.initialize(new DefaultDIDAdapter('https://api.elastos.io/eid'));
    const didObj = new DID(did);
    didObj
      .resolve(true)
      .then((didDoc) => {
        if (!didDoc) resolve({});
        const credentials = didDoc.getCredentials();
        const properties = credentials.reduce((props, c) => {
          const fragment = c.id['fragment']
          props[fragment] = c.subject['properties'][fragment];
          return props;
        }, {});
        resolve(properties);
      })
      .catch((error) => {
        reject(error);
      });
  });

export const getAppPreference = () => {
  const PrefConf = localStorage.getItem('FEEDS_PREF')
  let initConf = {DP: 0, DC: 0}
  if(PrefConf) {
    try {
      const tempConf = JSON.parse(PrefConf)
      if(typeof tempConf == 'object') {
        initConf = tempConf
      }
    } catch (err) {
      return initConf
    }
  }
  return initConf
}

export const getDateDistance = (timestamp) => timestamp ? formatDistance(new Date(timestamp), new Date(), { addSuffix: false }).replace("about","").trim() : ''

export const isValidTime = (timestamp) => (new Date(timestamp)).getTime() > 0;

function compareDateDesc( a, b ) {
  if ( a.created > b.created ){
    return -1;
  }
  if ( a.created < b.created ){
    return 1;
  }
  return 0;
}

function compareDateAsc( a, b ) {
  if ( a.created_at > b.created_at ){
    return 1;
  }
  if ( a.created_at < b.created_at ){
    return -1;
  }
  return 0;
}

export const sortByDate = (objs, direction = 'desc') => {
  objs.sort( direction=="desc"? compareDateDesc: compareDateAsc );
  return objs
}

export const getBufferFromFile = (f) => (
  new Promise((resolve, reject)=>{
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(f);
    reader.onloadend = async() => {
      try {
        const fileContent = Buffer.from(reader.result as string)
        resolve(fileContent)
      } catch (error) {
        reject(error);
      }
    }
  })
)

export function hash(string) {
  return createHash('sha256').update(string).digest('hex');
}

export function getFilteredArrayByUnique(arr, field) {
  var result = arr.reduce((unique, o) => {
    if(!unique.some(obj => obj[field] === o[field])) {
      unique.push(o);
    }
    return unique;
  },[]);
  return result
}

export function convertAutoLink(content) {
  var autolinker = new Autolinker( {
    urls : {
        schemeMatches : true,
        tldMatches    : true,
        ipV4Matches   : true,
    },
    email       : true,
    phone       : true,
    mention     : 'twitter',
    hashtag     : 'twitter',

    stripPrefix : true,
    stripTrailingSlash : true,
    newWindow   : true,

    truncate : {
        length   : 0,
        location : 'end'
    },

    className : 'outer-link'
  } );

  let tempContent = content
  let filteredContentByLink = autolinker.link(tempContent);
  let splitByHttp = filteredContentByLink.split('http')
  splitByHttp = splitByHttp.slice(0, splitByHttp.length-1)
  const brokenLinkStrings = splitByHttp.filter(el=>el.charAt(el.length-1)!='"')
  if(brokenLinkStrings.length){
    brokenLinkStrings.forEach(str=>{
      const lastChar = str.charAt(str.length-1)
      tempContent = tempContent.replace(`${lastChar}http`, `${lastChar} http`)
    })
    filteredContentByLink = autolinker.link(tempContent);
  }
  return filteredContentByLink
}

export function getMergedArray(obj): any[] {
  return Object.values(obj).flat(1)
}

export function getPostByChannelId(channel, setter) {
  const prefConf = getAppPreference()
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const userDid = `did:elastos:${feedsDid}`
  const hiveApi = new HiveApi()
  hiveApi.queryPostByChannelId(channel.target_did, channel.channel_id)
    .then(postRes=>{
      if(postRes['find_message'] && postRes['find_message']['items']) {
        const postArr = prefConf.DP?
          postRes['find_message']['items']:
          postRes['find_message']['items'].filter(postItem=>postItem.status!==CommonStatus.deleted)
        const splitTargetDid = channel.target_did.split(':')
        postArr.map(post=>{
          post.target_did = splitTargetDid[splitTargetDid.length-1]
          if(typeof post.created == 'object')
            post.created = new Date(post.created['$date']).getTime()/1000
        })
        postArr.forEach(post=>{
          if(post.status !== CommonStatus.deleted) {
            const contentObj = JSON.parse(post.content)
            contentObj.mediaData.forEach((media, _i)=>{
              if(!media.originMediaPath)
                return
              hiveApi.downloadScripting(channel.target_did, media.originMediaPath)
                .then(res=>{
                  if(res) {
                    setter((prevState) => {
                      const tempState = {...prevState}
                      const currentGroup = tempState[channel.channel_id]
                      const postIndex = currentGroup.findIndex(el=>el.post_id==post.post_id)
                      if(postIndex<0)
                        return tempState
                      if(currentGroup[postIndex].mediaData)
                        currentGroup[postIndex].mediaData.push({...media, mediaSrc: res})
                      else
                        currentGroup[postIndex].mediaData = [{...media, mediaSrc: res}]
                      return tempState
                    })
                  }
                })
                .catch(err=>{
                  console.log(err)
                })
            })
          }
          hiveApi.queryLikeById(channel.target_did, channel.channel_id, post.post_id, '0')
            .then(likeRes=>{
              if(likeRes['find_message'] && likeRes['find_message']['items']) {
                const likeArr = likeRes['find_message']['items']
                const filteredLikeArr = getFilteredArrayByUnique(likeArr, 'creater_did')
                const likeCreators = filteredLikeArr.map(item=>item.creater_did)
                const likeIndexByMe = likeCreators.includes(userDid)

                setter((prevState) => {
                  const tempState = {...prevState}
                  const currentGroup = tempState[channel.channel_id]
                  const postIndex = currentGroup.findIndex(el=>el.post_id==post.post_id)
                  if(postIndex<0)
                    return tempState
                  currentGroup[postIndex].likes = filteredLikeArr.length
                  currentGroup[postIndex].like_me = likeIndexByMe
                  currentGroup[postIndex].like_creators = likeCreators
                  return tempState
                })
              }
              // console.log(likeRes, "--------------5", post)
            })
        })
        const postIds = postArr.map(post=>post.post_id)
        hiveApi.queryCommentsFromPosts(channel.target_did, channel.channel_id, postIds)
          .then(commentRes=>{
            if(commentRes['find_message'] && commentRes['find_message']['items']) {
              const commentArr = commentRes['find_message']['items']
              const ascCommentArr = sortByDate(commentArr, 'asc')
              const linkedComments = ascCommentArr.reduce((res, item)=>{
                if(item.refcomment_id == '0') {
                    res.push(item)
                    return res
                }
                const tempRefIndex = res.findIndex((c) => c.comment_id == item.refcomment_id)
                if(tempRefIndex<0){
                    res.push(item)
                    return res
                }
                if(res[tempRefIndex]['commentData'])
                    res[tempRefIndex]['commentData'].push(item)
                else res[tempRefIndex]['commentData'] = [item]
                return res
              }, []).reverse()
            
              linkedComments.forEach(comment=>{
                setter((prevState) => {
                  const tempState = {...prevState}
                  const currentGroup = tempState[channel.channel_id]
                  const postIndex = currentGroup.findIndex(el=>el.post_id==comment.post_id)
                  if(postIndex<0)
                    return tempState
                  if(currentGroup[postIndex].commentData)
                    currentGroup[postIndex].commentData.push(comment)
                  else
                    currentGroup[postIndex].commentData = [comment]
                  return tempState
                })
              })
            }
            // console.log(commentRes, "--------------6")
          })
          setter((prevState) => {
          const tempState = {...prevState}
          tempState[channel.channel_id] = sortByDate(postArr)
          return tempState
        })
        // console.log(postArr, "---------------------3")
      }
    })
    .catch(err=>{
      // console.log(err, item)
    })
}

export function getPostShortUrl(post) {
  return new Promise((resolve, reject) => {
    const {target_did, channel_id, post_id} = post
    const postUrl = `${process.env.REACT_APP_BASEURL_POST_URL}/?targetDid=${target_did}&channelId=${channel_id}&postId=${post_id}`
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: postUrl })
    };
    fetch(`${process.env.REACT_APP_SHORTEN_SERVICE_URL}/api/v2/action/shorten?key=9fa8ef7f86a28829f53375abcb0af5`, requestOptions)
      .then(response=>response.text())
      .then(resolve)
      .catch((err) => {
        resolve(postUrl)
      })
  });
}

export async function copy2clipboard(text) {
  if ("clipboard" in navigator) {
    await navigator.clipboard.writeText(text);
  } else {
    document.execCommand("copy", true, text);
  }
}