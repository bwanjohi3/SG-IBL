import * as actionTypes from './actionTypes';

export function update(params) {
    return {
        type: actionTypes.UPDATE_ISSUING_UNIT,
        params: params
    };
}
