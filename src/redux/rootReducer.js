import { combineReducers } from 'redux';
// slices
import channelReducer from './slices/channel';

// ----------------------------------------------------------------------
const rootReducer = combineReducers({
  channel: channelReducer,
});

export { rootReducer };
