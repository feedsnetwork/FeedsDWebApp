import React from 'react'
// import { HiveApi } from "services/HiveApi"

self.addEventListener('message', e => {
    if (e.data === 'hello') {
      // const hiveApi = new HiveApi()
      postMessage('ok');
    }
});