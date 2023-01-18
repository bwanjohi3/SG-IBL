import * as actionTypes from './actionTypes';

export function openActionWithReason(params) {
    return {
        type: actionTypes.OPEN_ACTION_WITH_REASON,
        params
    };
};

export function closeActionWithReason() {
    return {
        type: actionTypes.CLOSE_ACTION_WITH_REASON
    };
};

export function changeInput(params) {
    return {
        type: actionTypes.CHANGE_INPUT,
        params: params
    };
};

export function clearState() {
    return {
        type: actionTypes.CLEAR
    };
};
