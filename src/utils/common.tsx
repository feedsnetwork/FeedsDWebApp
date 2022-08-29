import { DID, DIDBackend, DefaultDIDAdapter } from '@elastosfoundation/did-js-sdk';

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