import { createSlice } from '@reduxjs/toolkit';
// ----------------------------------------------------------------------

const initialState = {
  publicPosts: {},
  isOpened2Post: false,
  isOpened2Comment: false,
  activePost: null,
  activePostProps: {}
};

const slice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    openPostModal(state) {
      state.isOpened2Post = true;
    },
    closePostModal(state) {
      state.isOpened2Post = false;
    },
    openCommentModal(state) {
      state.isOpened2Comment = true;
    },
    closeCommentModal(state) {
      state.isOpened2Comment = false;
    },
    setActivePost(state, action) {
      state.activePost = action.payload;
    },
    setActivePostProps(state, action) {
      state.activePostProps = action.payload;
    },
    setPublicPosts(state, action) {
      state.publicPosts = {...state.publicPosts, ...action.payload}
    },
    updateMediaOfPosts(state, action) {
      const post = action.payload
      const currentGroup = [...state.publicPosts[post.channel_id]]
      const postIndex = currentGroup.findIndex(el=>el.post_id === post.post_id)
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
export const { setPublicPosts, setActivePost, setActivePostProps, updateMediaOfPosts } = slice.actions;

// ----------------------------------------------------------------------

export function selectPublicPosts(state) {
  return state.post.publicPosts
}
export function selectPostModalState(state) {
  return state.post.isOpened2Post
}
export function selectCommentModalState(state) {
  return state.post.isOpened2Comment
}
export function handlePostModal(isOpened) {
  return (dispatch) => {
    dispatch(
      isOpened?
      slice.actions.openPostModal():
      slice.actions.closePostModal()
    );
  };
}
export function handleCommentModal(isOpened) {
  return (dispatch) => {
    dispatch(
      isOpened?
      slice.actions.openCommentModal():
      slice.actions.closeCommentModal()
    );
  };
}
export function selectActivePost(state) {
  return state.post.activePost
}
export function selectActivePostProps(state) {
  return state.post.activePostProps
}