import { combineReducers } from 'redux';
// slices
import channelReducer from './slices/channel';
import postReducer from './slices/post';
import userReducer from './slices/user';
import procReducer from './slices/proc';

// ----------------------------------------------------------------------
const rootReducer = combineReducers({
  channel: channelReducer,
  post: postReducer,
  user: userReducer,
  proc: procReducer,
});

export { rootReducer };
