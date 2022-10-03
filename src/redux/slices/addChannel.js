import { createSlice } from '@reduxjs/toolkit';
// ----------------------------------------------------------------------

const initialState = {
  isChannelCreated: false,
};

const slice = createSlice({
  name: 'addChannel',
  initialState,
  reducers: {
    openSuccessModal(state) {
      state.isChannelCreated = true;
    },
    closeSuccessModal(state) {
      state.isChannelCreated = false;
    },
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { openSuccessModal } = slice.actions;

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
export function selectSuccessModalState(state) {
  return state.addChannel.isChannelCreated
}