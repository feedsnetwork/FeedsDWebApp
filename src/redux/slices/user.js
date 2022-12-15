import { createSlice } from '@reduxjs/toolkit';
// ----------------------------------------------------------------------

const initialState = {
  myInfo: {},
  userData: {}
};

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setMyInfo(state, action) {
      state.myInfo = {...state.myInfo, ...action.payload}
    },
    setUserInfo(state, action) {
      const prevUserDocs = {...state.userData}
      if(Array.isArray(action.payload)) {
        let tempDocs = [...action.payload]
        const newUserDocs = tempDocs
          .filter(doc=>!Object.keys(prevUserDocs).includes(doc?.user_did))
          .reduce((group, doc)=>{
            group[doc?.user_did] = doc
            return group
          }, {})
        tempDocs
          .filter(doc=>Object.keys(prevUserDocs).includes(doc?.user_did))
          .map(doc=>{
            prevUserDocs[doc?.user_did] = {...prevUserDocs[doc?.user_did], ...doc}
            return true
          })
        state.userData = { ...prevUserDocs, ...newUserDocs }
        return
      }
      Object.keys(action.payload).forEach(key=>{
        if(prevUserDocs[key])
          prevUserDocs[key] = {...prevUserDocs[key], ...action.payload[key]}
        else
          prevUserDocs[key] = {...action.payload[key]}
      })
      state.userData = prevUserDocs
    },
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { setMyInfo, setUserInfo } = slice.actions;

// ----------------------------------------------------------------------

export function selectMyInfo(state) {
  return state.user.myInfo
}
export function selectMyName(state) {
  return state.user.myInfo['name']
}
export const selectUserInfoByDID = (userDID) => (state) => {
  return state.user.userData[userDID]
}