import Web3 from 'web3';
import { DID, DIDBackend, DefaultDIDAdapter } from '@elastosfoundation/did-js-sdk';
import { formatDistance } from 'date-fns';
import createHash from 'hash.js'
import Autolinker from 'autolinker';
import axios from 'axios'
import copy from 'copy-to-clipboard';
import BigNumber from "bignumber.js";

import { essentialsConnector } from 'content/signin/EssentialConnectivity';
import { ipfsURL, rpcURL } from 'config'

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
  if ( a.created_at > b.created_at ){
    return -1;
  }
  if ( a.created_at < b.created_at ){
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
  return objs.slice().sort( direction==="desc"? compareDateDesc: compareDateAsc );
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
export const getBufferFromUrl = async (url) => {
  const image = await axios.get(url, {responseType: 'arraybuffer'});
  return Buffer.from(image.data);
}

export function hash(string) {
  return createHash.sha256().update(string).digest('hex');
}
export function decFromHex(hex) {
  const bigNum = new BigNumber(hex, 16);
  return bigNum.toString(10)
}
export function hexFromDec(dec) {
  const bigNum = new BigNumber(dec, 10);
  return bigNum.toString(16);
}

export function getFilteredArrayByUnique(arr, field) {
  var result = arr.reduce((unique, o) => {
    if(!unique.some(obj => obj[field] === o[field])) {
      unique.push(o);
    }
    return unique;
  }, []);
  return result
}
export function filterAlreadyQueried(origin, needle, field) {
  const result = origin.filter(item => !needle.includes(item[field]));
  return result
}
export function excludeFromArray(origin, needleArr, needleKey) {
  const result = origin.filter(item => !needleArr.includes(item[needleKey]));
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
  const brokenLinkStrings = splitByHttp.filter(el=>el.charAt(el.length-1)!=='"')
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

function getShortUrl(data, type='post') {
  return new Promise((resolve, reject) => {
    let shareUrl = ''
    if(type === 'post') {
      const {target_did, channel_id, post_id} = data
      shareUrl = `${process.env.REACT_APP_BASEURL_POST_URL}/v3post/?targetDid=${target_did}&channelId=${channel_id}&postId=${post_id}`
    } else if (type === 'channel') {
      const {target_did, channel_id} = data
      shareUrl = `${process.env.REACT_APP_BASEURL_POST_URL}/v3channel/?targetDid=${target_did}&channelId=${channel_id}`
    }
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: shareUrl })
    };
    fetch(`${process.env.REACT_APP_SHORTEN_SERVICE_URL}/api/v2/action/shorten?key=9fa8ef7f86a28829f53375abcb0af5`, requestOptions)
      .then(response=>response.text())
      .then(resolve)
      .catch((err) => {
        resolve(shareUrl)
      })
  });
}

export function getPostShortUrl(post) {
  return getShortUrl(post)
}
export function getChannelShortUrl(channel) {
  return getShortUrl(channel, 'channel')
}
export async function copy2clipboard(text) {
  copy(text)
  // if ("clipboard" in navigator) {
  //   await navigator.clipboard.writeText(text);
  // } else {
  //   document.execCommand("copy", true, text);
  // }
}

export const getIpfsUrl = (uri) => {
  if (!uri || (uri.match(/:/g) || []).length!==2)
    return ''

  const prefixLen = uri.split(':', 2).join(':').length;
  if (prefixLen >= uri.length)
    return '';
  const tempUri = uri.substring(prefixLen + 1);
  return `${ipfsURL}/ipfs/${tempUri}`;
};

export const getWeb3Connect = (isWalletConnect=true) => {
  if(isWalletConnect) {
    const walletConnectProvider = isInAppBrowser() ? window['elastos'].getWeb3Provider() : essentialsConnector.getWalletConnectProvider();
    return new Web3(walletConnectProvider)
  }
  return new Web3(new Web3.providers.HttpProvider(rpcURL));
}
export const getWeb3Contract = (abi, address, isWalletConnect=true) => {
  const walletConnectWeb3 = getWeb3Connect(isWalletConnect)
  const channelRegContract = new walletConnectWeb3.eth.Contract(abi, address)
  return channelRegContract
}
export function isJson(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}
export const encodeBase64 = (data) => {
  if(!data)
    return ''
  return Buffer.from(data).toString('base64');
}
export const decodeBase64 = (data) => {
  if(!data)
    return ''
  return Buffer.from(data, 'base64').toString('ascii');
}
export function promiseSeries(arrayOfPromises) {
  var results = [];
  return arrayOfPromises.reduce(function(seriesPromise, promise) {
    return seriesPromise
      .then(() => typeof promise === 'function'? promise(): promise)
      .then((result) => {
        results.push(result)
        return Promise.resolve()
      })
  }, Promise.resolve())
  .then(function() {
    return results;
  });
};
export function getMinValueFromArray(arrayOfObject, field) {
  return Math.min(...arrayOfObject.map(obj=>(obj[field] || Infinity)))
}
// function bytesToSize(bytes) {
//   const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

//   if (bytes === 0) {
//     return "0 Byte";
//   }

//   const i = Math.floor(Math.log(bytes) / Math.log(1024));

//   return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
// }
export function compressImage(imgSrc) {
  const quality = 0.7
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      // showing the compressed image
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
    
      const originalWidth = img.width;
      const originalHeight = img.height;

      const canvasDimension = { width: 100, height: 100}
    
      if(Math.max(originalWidth, originalHeight) < 100) {
        canvasDimension.width = originalWidth
        canvasDimension.height = originalHeight
      } else {
        canvasDimension.width = originalWidth>originalHeight? 100: originalWidth/originalHeight * 100;
        canvasDimension.height = originalHeight>originalWidth? 100: originalHeight/originalWidth * 100;
      }
    
      canvas.width = canvasDimension.width;
      canvas.height = canvasDimension.height;
    
      context.drawImage(
        img,
        0,
        0,
        canvasDimension.width,
        canvasDimension.height
      );
    
      // reducing the quality of the image
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
            // console.info(URL.createObjectURL(blob))
            // console.info(bytesToSize(blob.size))
          }
          else
            resolve('')
        },
        "image/jpeg",
        quality
      );
    }
  })
}
export const getImageSource = (content) => {
  let imgSrc = content || ""
  if(typeof imgSrc === 'object')
    imgSrc = URL.createObjectURL(imgSrc)
  else if(!imgSrc.startsWith("http"))
    imgSrc = decodeBase64(content || "")
  return imgSrc
}
export const LimitPostCount = 30