import { createSlice } from '@reduxjs/toolkit';
// ----------------------------------------------------------------------

const initialState = {
  avatarSrc: {},
  myInfo: {},
  users: {}
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
      state.users = {...state.users, ...action.payload}
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
  return state.user.users
}