import * as actionTypes from './actionTypes';

export function fetchUnits() {
    return {
        type: actionTypes.FETCH_UNITS,
        method: 'customer.organization.list',
        params: {}
    };
}
