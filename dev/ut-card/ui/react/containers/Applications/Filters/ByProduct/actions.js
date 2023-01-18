import * as actionTypes from './actionTypes';

export function updateProduct(params) {
    return {
        type: actionTypes.UPDATE_PRODUCT,
        params: params
    };
}
