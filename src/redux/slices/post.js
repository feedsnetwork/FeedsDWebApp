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
    },
    updateMediaOfPosts(state, action) {
      const post = action.payload
      const currentGroup = [...state.publicPosts[post.channel_id]]
      const postIndex = currentGroup.findIndex(el=>el.post_id==post.post_id)
      if(postIndex>=0) {
        if(currentGroup[postIndex].mediaData)
          currentGroup[postIndex].mediaData.push({mediaSrc: post.mediaSrc})
        else
          currentGroup[postIndex].mediaData = [{mediaSrc: post.mediaSrc}]
      }
      state.publicPosts[post.channel_id] = currentGroup
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { setPublicPosts, updateMediaOfPosts } = slice.actions;

// ----------------------------------------------------------------------

export function selectPublicPosts(state) {
  return state.post.publicPosts
}