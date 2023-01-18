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

export function fetchCustomerDetails(applicationId) {
    return {
        type: actionTypes.FETCH_APPLICATION_DETAILS,
        method: 'card.application.get',
        params: {
            applicationId
        }
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

export function changeDropdown(params) {
    return {
        type: actionTypes.CHANGE_DROPDOWN,
        params
    };
}

export function changeCardholderName(params) {
    return {
        type: actionTypes.CHANGE_CARDHOLDER_NAME,
        params
    };
}

export function changeMakerComment(params) {
    return {
        type: actionTypes.CHANGE_MAKER_COMMENT,
        params
    };
}

export const setErrors = (params) => ({
    type: actionTypes.SET_ERRORS,
    params
});

export function fetchDocumentTypes() {
    return {
        type: actionTypes.FETCH_DOCUMENT_TYPES,
        method: 'card.documentType.list',
        suppressPreloadWindow: true
    };
};
