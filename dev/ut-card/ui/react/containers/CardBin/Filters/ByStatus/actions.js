import * as actionTypes from './actionTypes';

export function updateStatus(params) {
    return {
        type: actionTypes.UPDATE_STATUS,
        params: params
    };
}
