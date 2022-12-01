import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Stack, Typography } from '@mui/material';

import StyledAvatar from 'components/StyledAvatar'
import { HiveApi } from 'services/HiveApi'
import { SidebarContext } from 'contexts/SidebarContext';
import { selectMyInfo, setMyInfo, setUserInfo } from 'redux/slices/user';
import { getLocalDB } from 'utils/db';
import { reduceDIDstring, getInfoFromDID, reduceHexAddress, encodeBase64, decodeBase64, compressImage } from 'utils/common'


function MyInfoAtBottom() {
  const { walletAddress } = React.useContext(SidebarContext)
  const dispatch = useDispatch()
  const myInfo = useSelector(selectMyInfo)
  const feedsDid = sessionStorage.getItem('FEEDS_DID')
  const myDID = `did:elastos:${feedsDid}`
  const hiveApi = new HiveApi()
  const LocalDB = getLocalDB()
  
  React.useEffect(()=>{
    if(!feedsDid)
      return
    LocalDB.get(myDID)
      .then(doc=>{
        dispatch(setMyInfo(doc))
      })
      .catch(err=>{})

    getInfoFromDID(myDID).then(res=>{
      const userInfoObj = {}
      userInfoObj[myDID] = res
      dispatch(setUserInfo(userInfoObj))
      storeMyInfo(res as object)
    })
    hiveApi.getHiveUrl(myDID)
      .then(hiveUrl=>hiveApi.downloadFileByHiveUrl(myDID, hiveUrl))
      .then(res=>{
        const resBuf = res as Buffer
        if(resBuf && resBuf.length) {
          const base64Content = resBuf.toString('base64')
          return compressImage(`data:image/png;base64,${base64Content}`)
        }
        return ''
      })
      .then(avatarSrc=>{
        const avatarObj = { avatarSrc: encodeBase64(avatarSrc) }
        storeMyInfo(avatarObj)
        const avatarUserObj = {}
        avatarUserObj[myDID] = avatarObj
        dispatch(setUserInfo(avatarUserObj))
      })
      .catch(err=>{})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const storeMyInfo = (userInfo: object)=>{
    dispatch(setMyInfo(userInfo))
    LocalDB.upsert(myDID, (doc)=>{
      return {...doc, ...userInfo, table_type: 'user'}
    })
  }
  return (
    <Box p={1}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <StyledAvatar alt="" src={decodeBase64(myInfo['avatarSrc'])} width={36}/>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="subtitle2" noWrap>
            {myInfo['name'] || reduceHexAddress(walletAddress)}
          </Typography>
          <Typography variant="body2" noWrap>
            {reduceDIDstring(myDID)}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export default React.memo(MyInfoAtBottom);
