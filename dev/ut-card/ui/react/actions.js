import {methodRequestState} from './containers/constants';

export const actionList = {
    SET_CONFIG: Symbol('SET_CONFIG'),
    TOGGLE_PRELOAD: Symbol('TOGGLE_PRELOAD')
};

export const setConfig = (config) => { return {type: actionList.SET_CONFIG, config}; };

export const showPreload = (index) => ({
    type: actionList.TOGGLE_PRELOAD,
    methodRequestState: methodRequestState.REQUESTED
});

export const hidePreload = (index) => ({
    type: actionList.TOGGLE_PRELOAD,
    methodRequestState: methodRequestState.FINISHED
});
