import { createSlice } from '@reduxjs/toolkit';
// ----------------------------------------------------------------------

const initialState = {
  isChannelCreated: false,
  isOpened2Publish: false,
  isOpened2Unpublish: false,
  isOpened2Unsubscribe: false,
  activeChannelId: 0, // active self channel id for detail
  focusedChannelId: 0, // focused self channel id
  visitedChannelId: 0, // selected subscribed channel id
  avatarSrc: {},
  targetChannel: {}, // target channel object to publish/unpublish/unsubscribe
  dispNameOfChannels: {},
  subscribers: {},
  publicChannels: {}
};

const slice = createSlice({
  name: 'channel',
  initialState,
  reducers: {
    openSuccessModal(state) {
      state.isChannelCreated = true;
    },
    closeSuccessModal(state) {
      state.isChannelCreated = false;
    },
    openPublishModal(state) {
      state.isOpened2Publish = true;
    },
    closePublishModal(state) {
      state.isOpened2Publish = false;
    },
    openUnpublishModal(state) {
      state.isOpened2Unpublish = true;
    },
    closeUnpublishModal(state) {
      state.isOpened2Unpublish = false;
    },
    openUnsubscribeModal(state) {
      state.isOpened2Unsubscribe = true;
    },
    closeUnsubscribeModal(state) {
      state.isOpened2Unsubscribe = false;
    },
    setTargetChannel(state, action) {
      state.targetChannel = action.payload
    },
    setPublicChannels(state, action) {
      const tempState = {...state.publicChannels}
      tempState[action.payload.channel_id] = action.payload.data
      state.publicChannels = tempState
    },
    setDispNameOfChannels(state, action) {
      state.dispNameOfChannels = {...state.dispNameOfChannels, ...action.payload}
    },
    setActiveChannelId(state, action) {
      state.activeChannelId = action.payload
    },
    setFocusedChannelId(state, action) {
      state.focusedChannelId = action.payload
    },
    setVisitedChannelId(state, action) {
      state.visitedChannelId = action.payload
    },
    setChannelAvatarSrc(state, action) {
      state.avatarSrc = {...state.avatarSrc, ...action.payload}
    },
    setSubscribers(state, action) {
      state.subscribers = {...state.subscribers, ...action.payload}
    },
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { 
  setTargetChannel, 
  setPublicChannels, 
  setDispNameOfChannels, 
  setFocusedChannelId, 
  setActiveChannelId, 
  setVisitedChannelId, 
  setChannelAvatarSrc, 
  setSubscribers 
} = slice.actions;

// ----------------------------------------------------------------------

export function handleSuccessModal(isCreated) {
  return (dispatch) => {
    dispatch(
      isCreated?
      slice.actions.openSuccessModal():
      slice.actions.closeSuccessModal()
    );
  };
}
export function handlePublishModal(isOpened) {
  return (dispatch) => {
    dispatch(
      isOpened?
      slice.actions.openPublishModal():
      slice.actions.closePublishModal()
    );
  };
}
export function handleUnpublishModal(isOpened) {
  return (dispatch) => {
    dispatch(
      isOpened?
      slice.actions.openUnpublishModal():
      slice.actions.closeUnpublishModal()
    );
  };
}
export function handleUnsubscribeModal(isOpened) {
  return (dispatch) => {
    dispatch(
      isOpened?
      slice.actions.openUnsubscribeModal():
      slice.actions.closeUnsubscribeModal()
    );
  };
}
export function selectSuccessModalState(state) {
  return state.channel.isChannelCreated
}
export function selectPublishModalState(state) {
  return state.channel.isOpened2Publish
}
export function selectUnpublishModalState(state) {
  return state.channel.isOpened2Unpublish
}
export function selectUnsubscribeModalState(state) {
  return state.channel.isOpened2Unsubscribe
}
export function selectTargetChannel(state) {
  return state.channel.targetChannel
}
export function selectPublicChannels(state) {
  return state.channel.publicChannels
}
export function selectDispNameOfChannels(state) {
  return state.channel.dispNameOfChannels
}
export function selectActiveChannelId(state) {
  return state.channel.activeChannelId
}
export function selectFocusedChannelId(state) {
  return state.channel.focusedChannelId
}
export function selectVisitedChannelId(state) {
  return state.channel.visitedChannelId
}
export function selectChannelAvatar(state) {
  return state.channel.avatarSrc
}
export function selectSubscribers(state) {
  return state.channel.subscribers
}