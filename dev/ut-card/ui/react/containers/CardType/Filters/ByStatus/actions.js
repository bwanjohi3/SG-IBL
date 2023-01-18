import * as actionTypes from './actionTypes';

export const changeStatusFilter = (newValue) => ({
    type: actionTypes.CHANGE_STATUS_FILTER,
    params: newValue
});
