import { DID, DIDBackend, DefaultDIDAdapter } from '@elastosfoundation/did-js-sdk';
import { formatDistance } from 'date-fns';
import { createHash } from 'crypto';

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