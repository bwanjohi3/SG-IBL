import * as actionTypes from './actionTypes';

export function openCreateBatchDialog(applications, disabled = false) {
    return {
        type: actionTypes.OPEN_CREATE_BATCH_DIALOG,
        applications,
        disabled
    };
}

export function closeCreateBatchDialog() {
    return {
        type: actionTypes.CLOSE_CREATE_BATCH_DIALOG
    };
}

export function fetchBusinessUnits() {
    return {
        type: actionTypes.FETCH_BUSINESS_UNITS,
        method: 'customer.organization.list',
        params: {},
        suppressPreloadWindow: true
    };
}

export function changeBatchName(params) {
    return {
        type: actionTypes.CHANGE_BATCH_NAME,
        params
    };
}

export function changeBusinessUnit(params) {
    return {
        type: actionTypes.CHANGE_BUSINESS_UNIT,
        params
    };
}

export function checkApplication(rowIdx, row, state) {
    return {
        type: actionTypes.CHECK_APPLICATION,
        params: {
            rowIdx,
            row,
            state
        }
    };
}

export const setErrors = (form) => ({
    type: actionTypes.SET_ERRORS,
    params: {
        form
    }
});
