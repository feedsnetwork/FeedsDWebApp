export const firebaseConfig = {
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APPID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const ApplicationDIDForMain = "did:elastos:iqtWRVjz7gsYhyuQEb1hYNNmWQt1Z9geXg"
// const ApplicationDIDForTest = "did:elastos:ic8pRXyAT3JqEXo4PzHQHv5rsoYyEyDwpB"
export const DidResolverUrl = 'https://api.trinity-tech.io/eid'
  // process.env.REACT_APP_ENV === 'production' ? 'mainnet' : 'testnet';

const rpcUrlForMain = "https://api.elastos.io/eth"
const rpcUrlForTest = "https://api-testnet.elastos.io/eth"

export const rpcURL = process.env.REACT_APP_ENV==="production"?rpcUrlForMain:rpcUrlForTest
export const ipfsURL = process.env.REACT_APP_ENV === "production" ? process.env.REACT_APP_IPFS_URL_MAIN : process.env.REACT_APP_IPFS_URL_TEST
export const ApplicationDID = ApplicationDIDForMain

export const trustedProviders = [
  "did:elastos:iqjN3CLRjd7a4jGCZe6B3isXyeLy7KKDuK" // Trinity Tech KYC
]

const ChannelRegContractMain = "0xc76E72deE2021cc51b094AfcD1e7010c74037bcB"
const ChannelRegContractTest = "0xc76E72deE2021cc51b094AfcD1e7010c74037bcB"
export const ChannelRegContractAddress = process.env.REACT_APP_ENV==="production"?ChannelRegContractMain:ChannelRegContractTest
export const blankAddress = "0x0000000000000000000000000000000000000000";