import * as actionTypes from './actionTypes';

export function update(params) {
    return {
        type: actionTypes.UPDATE_TARGET_UNIT,
        params: params
    };
};
