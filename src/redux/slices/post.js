import { createSlice } from '@reduxjs/toolkit';
// ----------------------------------------------------------------------

const initialState = {
  publicPosts: {}
};

const slice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    setPublicPosts(state, action) {
      state.publicPosts = {...state.publicPosts, ...action.payload}
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { setPublicPosts } = slice.actions;

// ----------------------------------------------------------------------

export function selectPublicPosts(state) {
  return state.post.publicPosts
}