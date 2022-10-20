import { createSlice } from '@reduxjs/toolkit';
// ----------------------------------------------------------------------

const initialState = {
  avatarSrc: {}
};

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserAvatarSrc(state, action) {
      state.avatarSrc = {...state.avatarSrc, ...action.payload}
    },
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { setUserAvatarSrc } = slice.actions;

// ----------------------------------------------------------------------

export function selectUserAvatar(state) {
  return state.user.avatarSrc
}