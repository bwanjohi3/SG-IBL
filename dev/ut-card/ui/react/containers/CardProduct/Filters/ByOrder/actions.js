import * as actionTypes from './actionTypes';

export const changeOrderFilter = (column, direction) => ({
    type: actionTypes.CHANGE_ORDER_FILTER,
    params: {column, direction}
});
