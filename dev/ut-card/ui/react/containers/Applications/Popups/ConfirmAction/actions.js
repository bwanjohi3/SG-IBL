import * as actionTypes from './actionTypes';

export function openActionConfirmDialog(params) {
    return {
        type: actionTypes.OPEN_ACTION_CONFIRM_PROMPT,
        params
    };
};

export function closeActionConfirmDialog() {
    return {
        type: actionTypes.CLOSE_ACTION_CONFIRM_PROMPT
    };
};
