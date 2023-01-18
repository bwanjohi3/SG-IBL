import * as actionTypes from './actionTypes';

export function openDetailsDialog(application, actionDataId) {
    return {
        type: actionTypes.OPEN_DETAILS_DIALOG
    };
}

export function closeDetailsDialog() {
    return {
        type: actionTypes.CLOSE_DETAILS_DIALOG
    };
}

export function fetchBinDetails(binId) {
    return {
        type: actionTypes.FETCH_BIN_DETAILS,
        method: 'card.bin.get',
        params: {
            binId
        }
    };
}

export function changeOwnership(params) {
    return {
        type: actionTypes.CHANGE_OWNERSHIP,
        params
    };
}

export function changeDescription(params) {
    return {
        type: actionTypes.CHANGE_DESCRIPTION,
        params
    };
}

export function changeStartBin(params) {
    return {
        type: actionTypes.CHANGE_START_BIN,
        params
    };
}

export function changeEndBin(params) {
    return {
        type: actionTypes.CHANGE_END_BIN,
        params
    };
}

export function editBins(params) {
    return {
        type: actionTypes.EDIT_BIN,
        method: 'card.bin.edit',
        params
    };
}

export function statusUpdateBins(params) {
    return {
        type: actionTypes.STATUS_UPDATE_BIN,
        method: 'card.bin.statusUpdate',
        params
    };
}

export const setErrors = (params) => ({
    type: actionTypes.SET_ERRORS,
    params
});
