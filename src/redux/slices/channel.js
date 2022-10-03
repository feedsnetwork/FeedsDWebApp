import { createSlice } from '@reduxjs/toolkit';
// ----------------------------------------------------------------------

const initialState = {
  isChannelCreated: false,
  isOpened2Publish: false,
  createdChannel: {}
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
    setCreatedChannel(state, action) {
      state.createdChannel = action.payload
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { setCreatedChannel } = slice.actions;

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
export function selectSuccessModalState(state) {
  return state.channel.isChannelCreated
}
export function selectPublishModalState(state) {
  return state.channel.isOpened2Publish
}
export function selectCreatedChannel(state) {
  return state.channel.createdChannel
}