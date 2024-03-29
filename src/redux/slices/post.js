import { createSlice } from '@reduxjs/toolkit';
// ----------------------------------------------------------------------

const initialState = {
  publicPosts: {},
  isOpened2Post: false,
  isOpened2Comment: false,
  isOpened2DelPost: false,
  activePost: null,
  activePostProps: {},
  loadedPostMedia: {},
  loadedPostCount: 0,
  nextLoadNum: 0,
  isOpenImageScreen: false,
  activeImagePath: null
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
    openDelPostModal(state) {
      state.isOpened2DelPost = true;
    },
    closeDelPostModal(state) {
      state.isOpened2DelPost = false;
    },
    increaseLoadNum(state) {
      state.nextLoadNum += 1;
    },
    setActivePost(state, action) {
      state.activePost = action.payload;
    },
    setOpenImageScreen(state, action) {
      state.isOpenImageScreen = action.payload;
    },
    setActiveImagePath(state, action) {
      state.activeImagePath = action.payload;
    },
    setActivePostProps(state, action) {
      state.activePostProps = action.payload;
    },
    setPublicPosts(state, action) {
      state.publicPosts = {...state.publicPosts, ...action.payload}
    },
    setPostMediaLoaded(state, action) {
      if(Array.isArray(action.payload)) {
        if(!action.payload.length)
          return
        state.loadedPostMedia = action.payload.reduce((mediaObj, post)=>{
          mediaObj[post.post_id] = post['media_path']
          return mediaObj
        }, {})
        return
      }
      const {postId, mediaPath} = action.payload
      if(!state.loadedPostMedia[postId])
        state.loadedPostMedia[postId] = mediaPath
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
    },
    updateLoadedPostCount(state, action) {
      state.loadedPostCount += action.payload
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { 
  setPublicPosts, 
  setActivePost, 
  setActivePostProps, 
  increaseLoadNum, 
  updateMediaOfPosts, 
  updateLoadedPostCount,
  setPostMediaLoaded,
  setOpenImageScreen,
  setActiveImagePath
} = slice.actions;

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
export function selectDelPostModalState(state) {
  return state.post.isOpened2DelPost
}
export function selectNextLoadNum(state) {
  return state.post.nextLoadNum
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
export function handleDelPostModal(isOpened) {
  return (dispatch) => {
    dispatch(
      isOpened?
      slice.actions.openDelPostModal():
      slice.actions.closeDelPostModal()
    );
  };
}
export function selectActivePost(state) {
  return state.post.activePost
}
export function selectActivePostProps(state) {
  return state.post.activePostProps
}
export function selectLoadedPostCount(state) {
  return state.post.loadedPostCount
}
export const selectLoadedPostMedia = (postId) => (state) => {
  return state.post.loadedPostMedia[postId]
}
export function selectPostImgScreenState(state) {
  return state.post.isOpenImageScreen
}
export function selectPostImgPath(state) {
  return state.post.activeImagePath
}