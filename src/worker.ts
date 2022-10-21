import React from 'react'
// import { connectivity, DID as ConDID } from "@elastosfoundation/elastos-connectivity-sdk-js";

self.addEventListener('message', e => {
    if (e.data === 'hello') {
      postMessage('ok');
    }
});