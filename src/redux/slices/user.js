import { createSlice } from '@reduxjs/toolkit';
// ----------------------------------------------------------------------

const initialState = {
  avatarSrc: {},
  myInfo: {}
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
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { setUserAvatarSrc, setMyInfo } = slice.actions;

// ----------------------------------------------------------------------

export function selectUserAvatar(state) {
  return state.user.avatarSrc
}
export function selectMyInfo(state) {
  return state.user.myInfo
}