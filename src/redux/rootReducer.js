import { combineReducers } from 'redux';
// slices
import channelReducer from './slices/channel';
import postReducer from './slices/post';
import userReducer from './slices/user';

// ----------------------------------------------------------------------
const rootReducer = combineReducers({
  channel: channelReducer,
  post: postReducer,
  user: userReducer,
});

export { rootReducer };
