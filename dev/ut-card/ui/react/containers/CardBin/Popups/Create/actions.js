import * as actionTypes from './actionTypes';

export const fetchOwnershipTypes = () => ({
    type: actionTypes.FETCH_OWNERSHIP_TYPES,
    method: 'card.ownershipType.fetch',
    params: {}
});

export const handleOwnershipTypeIdChange = (value) => ({
    type: actionTypes.HANDLE_OWNERHIP_TYPE_CHANGE,
    value
});

export function openCreateBinDialog() {
    return {
        type: actionTypes.OPEN_CREATE_BIN_DIALOG
    };
}

export function closeCreateBinDialog() {
    return {
        type: actionTypes.CLOSE_CREATE_BIN_DIALOG
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

export function changeDescription(params) {
    return {
        type: actionTypes.CHANGE_BIN_DESCRIPTION,
        params
    };
}

export function createBin(params) {
    return {
        type: actionTypes.CREATE_BIN,
        method: 'card.bin.add',
        params
    };
}

export const setErrors = (form) => ({
    type: actionTypes.SET_ERRORS,
    params: {
        form
    }
});
