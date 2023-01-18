import * as actionTypes from './actionTypes';

export function updateUnit(params) {
    return {
        type: actionTypes.UPDATE_UNIT,
        params: params
    };
}

export function fetch() {
    return {
        type: actionTypes.FETCH_UNITS,
        method: 'customer.organization.list',
        params: {},
        suppressPreloadWindow: true
    };
}
