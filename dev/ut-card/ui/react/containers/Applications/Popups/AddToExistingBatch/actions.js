import * as actionTypes from './actionTypes';

export function openAddToExistingBatchDialog(applications, disabled = false) {
    return {
        type: actionTypes.OPEN_ADD_TO_EXISTING_BATCH_DIALOG,
        applications,
        disabled
    };
}
export function closeAddToExistingBatchDialog() {
    return {
        type: actionTypes.CLOSE_ADD_TO_EXISTING_BATCH_DIALOG
    };
}

export function fetchBatches(embossedTypeId) {
    return {
        type: actionTypes.FETCH_BATCHES,
        method: 'card.batch.list',
        params: {
            embossedTypeId
        },
        suppressPreloadWindow: true
    };
}

export function changeBatch(params) {
    return {
        type: actionTypes.CHANGE_BATCH,
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
