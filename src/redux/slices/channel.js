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
  targetChannel: {}, // target channel object to publish/unpublish/unsubscribe
  selfChannels: {},
  subscribedChannels: {},
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
    setChannelData(state, action) {
      const type = action.payload.type
      const channelData = action.payload.data
      const channelState = `${type}Channels`
      if(Array.isArray(channelData)) {
        const channelDocs = channelData.reduce((group, doc)=>{
          group[doc._id] = doc
          return group
        }, {})
        state[channelState] = channelDocs
        return
      }
      const tempState = {...state[channelState]}
      Object.keys(channelData).forEach(key=>{
        if(tempState[key])
          tempState[key] = {...tempState[key], ...channelData[key]}
      })
      state[channelState] = tempState
    },
    setPublicChannels(state, action) {
      const tempState = {...state.publicChannels}
      tempState[action.payload.channel_id] = action.payload.data
      state.publicChannels = tempState
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
  }
});

// Reducer
export default slice.reducer;

// Actions
export const {  
  setChannelData, 
  setPublicChannels, 
  setFocusedChannelId, 
  setActiveChannelId, 
  setVisitedChannelId, 
  setTargetChannel
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
export function selectSelfChannels(state) {
  return state.channel.selfChannels
}
export function selectSelfChannelsCount(state) {
  return Object.keys(state.channel.selfChannels).length
}
export function selectSubscribedChannels(state) {
  return state.channel.subscribedChannels
}
export function selectPublicChannels(state) {
  return state.channel.publicChannels
}
export const selectChannelById = channelId => state => {
  const channels = {...state.channel.selfChannels, ...state.channel.subscribedChannels, ...state.channel.publicChannels}
  return channels[channelId]
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