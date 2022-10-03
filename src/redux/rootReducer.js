import { combineReducers } from 'redux';
// slices
import addChannelReducer from './slices/addChannel';

// ----------------------------------------------------------------------
const rootReducer = combineReducers({
  addChannel: addChannelReducer,
});

export { rootReducer };
