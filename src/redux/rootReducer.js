import { combineReducers } from 'redux';
// slices
import channelReducer from './slices/channel';
import postReducer from './slices/post';

// ----------------------------------------------------------------------
const rootReducer = combineReducers({
  channel: channelReducer,
  post: postReducer,
});

export { rootReducer };
