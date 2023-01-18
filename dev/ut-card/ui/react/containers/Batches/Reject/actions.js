import * as actionTypes from './actionTypes';

export const toggleRejectBatchPopup = (params) => {
    return { type: actionTypes.TOGGLE_REJECT_BATCH_POPUP, params };
};
export const rejectBatch = (batchActionId, batchActionLabel, batch) => {
    return {
        type: actionTypes.REJECT_BATCH,
        method: 'card.batch.statusUpdate',
        params: {
            batchActionId: batchActionId,
            batchActionLabel: batchActionLabel,
            batch: batch
        }
    };
};
export const update = (params) => {
    return {
        type: actionTypes.UPDATE,
        params: params
    };
};
