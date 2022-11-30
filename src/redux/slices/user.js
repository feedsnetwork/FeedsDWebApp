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
      if(Array.isArray(action.payload)) {
        let tempDocs = [...action.payload]
        tempDocs = tempDocs.filter(doc=>!Object.keys(state.userData).includes(doc?.user_did))
        const userDocs = tempDocs.reduce((group, doc)=>{
          group[doc?.user_did] = doc
          return group
        }, {})
        state.userData = { ...state.userData, ...userDocs }
        return
      }
      const tempState = { ...state.userData }
      Object.keys(action.payload).forEach(key=>{
        if(tempState[key])
          tempState[key] = {...tempState[key], ...action.payload[key]}
      })
      state.userData = tempState
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
export const selectUserInfoByDID = (userDID) => (state) => {
  return state.user.userData[userDID]
}