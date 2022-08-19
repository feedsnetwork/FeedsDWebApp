import { createGlobalState } from 'react-hooks-global-state';
import { HiveApi } from 'src/services/HiveApi';

const actions = ({ setState, getState }) => ({
    // write function to handle current state
});

const initialState = {
    hiveApi: new HiveApi()
};

export const { useGlobalState } = createGlobalState(initialState);