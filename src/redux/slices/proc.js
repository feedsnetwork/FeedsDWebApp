import { createSlice } from '@reduxjs/toolkit';
// ----------------------------------------------------------------------

const initialState = {
  queryStep: {
    self_channel: 0,
    subscribed_channel: 0,
    post_data: 0,
    post_like: 0,
    post_image: 0,
    comment_data: 0,
    comment_like: 0,
  },
  queryPublicStep: {
    public_channel: 0,
    post_data: 0,
    post_like: 0,
    post_image: 0,
    comment_data: 0,
    comment_like: 0,
  }
};

const slice = createSlice({
  name: 'proc',
  initialState,
  reducers: {
    updateStep(state, action) {
      state.queryStep[action.payload] += 1
    },
    updatePublicStep(state, action) {
      state.queryPublicStep[action.payload] += 1
    },
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { updateStep, updatePublicStep } = slice.actions;

// ----------------------------------------------------------------------

export const selectQueryStep = (type) => (state) => {
  return state.proc.queryStep[type]
}
export const selectQueryStepStatus = (type) => (state) => {
  return state.proc.queryStep[type]>0
}
export const selectQueryPublicStep = (type) => (state) => {
  return state.proc.queryPublicStep[type]
}