import * as actionTypes from './actionTypes';

export function updateApplicationsPagination(params) {
    return {
        type: actionTypes.UPDATE_PAGINATION,
        params: params
    };
}
