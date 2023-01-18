import * as actionTypes from './actionTypes.js';

export const openFieldSelector = (params) => {
    return {type: actionTypes.OPEN_FIELD_SELECTOR, params: params};
};
export const closeFieldSelector = () => {
    return {type: actionTypes.CLOSE_FIELD_SELECTOR};
};
export const fieldSelectorSelectionChange = (value) => {
    return {
        type: actionTypes.FIELD_SELECTOR_SELECTION_CHANGE,
        value: value
    };
};

export const fetch = (userConfiguration) => ({
    type: actionTypes.FETCH,
    method: 'user.configuration.get',
    params: {
        userConfiguration: userConfiguration
    }
});
export const save = (userConfiguration) => ({
    type: actionTypes.SAVE,
    method: 'user.configuration.update',
    params: {
        userConfiguration: userConfiguration
    }
});
export const setDataField = () => ({type: actionTypes.SET_DATA_FIELD});
export const handleContinuousPaperClick = () => ({type: actionTypes.HANDLE_CONTINUOUS_PAPER_CLICK});
export const setContinuousPaperValue = (value) => ({type: actionTypes.SET_CONTINUOUS_PAPER_VALUE, value: value});
export const setPrintFormatString = (params) => ({type: actionTypes.SET_PRINT_FORMAT_STRING, params: params});
export const setPrintFormatStringFromDb = (value) => ({type: actionTypes.SET_PRINT_FORMAT_STRING_FROM_DB, value: value});
export const setVerticalData = (params) => ({type: actionTypes.SET_VERTICAL_DATA, params: params});
export const setGridFields = (gridFields, spanFields, pinMailerWidth) => ({type: actionTypes.SET_GRID_FIELDS, gridFields: gridFields, spanFields: spanFields, pinMailerWidth: pinMailerWidth});
export const setGridData = (gridData, pinMailerHeight) => ({type: actionTypes.SET_GRID_DATA, gridData: gridData, pinMailerHeight: pinMailerHeight});
export const setSelectedData = (selectedData) => ({type: actionTypes.SET_SELECTED_DATA, selectedData: selectedData});
export const setMailerWidth = (pinMailerWidth) => ({type: actionTypes.SET_MAILER_WIDTH, pinMailerWidth: pinMailerWidth});
export const setMailerHeight = (pinMailerHeight) => ({type: actionTypes.SET_MAILER_HEIGHT, pinMailerHeight: pinMailerHeight});
export const setErrors = (errors) => ({type: actionTypes.SET_ERRORS, errors: errors});

export const openConfirmationDialog = (params) => {
    return {
        type: actionTypes.OPEN_CONFIRMATION_DIALOG,
        params
    };
};
export const closeConfirmationDialog = () => {
    return {
        type: actionTypes.CLOSE_CONFIRMATION_DIALOG
    };
};
