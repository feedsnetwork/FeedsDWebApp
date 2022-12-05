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
  channels: {},
  postLoadedChannels: {}
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
      const channelData = action.payload
      if(Array.isArray(channelData)) {
        const channelDocs = channelData.reduce((group, doc)=>{
          group[doc._id] = doc
          return group
        }, {})
        state.channels = channelDocs
        return
      }
      const tempState = {...state.channels}
      Object.keys(channelData).forEach(key=>{
        if(state.channels[key])
          state.channels[key] = {...tempState[key], ...channelData[key]}
      })
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
    setPostLoadedChannel(state, action) {
      if(!state.postLoadedChannels[action.payload])
        state.postLoadedChannels[action.payload] = true
    },
  }
});

// Reducer
export default slice.reducer;

// Actions
export const {  
  setChannelData, 
  setFocusedChannelId, 
  setActiveChannelId, 
  setVisitedChannelId, 
  setTargetChannel,
  setPostLoadedChannel
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
const getChannelsByType = (channelObj, type) => {
  let filterFunc = channel=>channel['is_self']
  if(type === 'subscribed')
    filterFunc = channel=>(!channel['is_self'] && channel['is_subscribed'])
  else if(type === 'public')
    filterFunc = channel=>channel['is_public']
  return Object.values(channelObj)
    .filter(filterFunc)
    .reduce((res, channel)=>{
      res[channel.channel_id] = channel
      return res
    }, {})
}
export function selectSelfChannels(state) {
  return getChannelsByType(state.channel.channels, 'self')
}
export function selectSelfChannelsCount(state) {
  return Object.values(state.channel.channels).filter(channel=>channel['is_self']).length
}
export function selectSubscribedChannels(state) {
  return getChannelsByType(state.channel.channels, 'subscribed')
}
export function selectPublicChannels(state) {
  return getChannelsByType(state.channel.channels, 'public')
}
export const selectChannelById = channelId => state => {
  return state.channel.channels[channelId]
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
export const selectIsLoadedPost = (channelId) => (state) => {
  return !!state.channel.postLoadedChannels[channelId]
}