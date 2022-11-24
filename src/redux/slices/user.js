import { createSlice } from '@reduxjs/toolkit';
// ----------------------------------------------------------------------

const initialState = {
  avatarSrc: {},
  myInfo: {},
  userData: {}
};

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserAvatarSrc(state, action) {
      state.avatarSrc = {...state.avatarSrc, ...action.payload}
    },
    setMyInfo(state, action) {
      state.myInfo = {...state.myInfo, ...action.payload}
    },
    setUserInfo(state, action) {
      if(Array.isArray(action.payload)) {
        let tempDocs = [...action.payload]
        tempDocs = tempDocs.filter(doc=>!Object.keys(state.userData).includes(doc._id))
        const userDocs = tempDocs.reduce((group, doc)=>{
          group[doc._id] = doc
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
export const { setUserAvatarSrc, setMyInfo, setUserInfo } = slice.actions;

// ----------------------------------------------------------------------

export function selectUserAvatar(state) {
  return state.user.avatarSrc
}
export function selectMyInfo(state) {
  return state.user.myInfo
}
export function selectUsers(state) {
  return state.user.userData
}
export const selectUserInfoByDID = (userDID) => (state) => {
  return state.user.userData[userDID]
}