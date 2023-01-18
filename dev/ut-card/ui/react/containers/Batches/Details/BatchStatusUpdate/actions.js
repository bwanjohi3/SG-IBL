export const actionsList = {
    'TOGGLE_BATCH_STATUSUPDATE_PROMPT': Symbol('TOGGLE_BATCH_STATUSUPDATE_PROMPT'),
    'STATUSUPDATE_BATCH': Symbol('STATUSUPDATE_BATCH')
};

export const toggleStatusUpdatePrompt = (params) => {
    return { type: actionsList.TOGGLE_BATCH_STATUSUPDATE_PROMPT, params };
};
export const statusUpdateBatch = (batchActionId, batchActionLabel, batch, cardsCurrentBranchId) => {
    return {
        type: actionsList.STATUSUPDATE_BATCH,
        method: 'card.batch.statusUpdate',
        params: {
            batchActionId: batchActionId,
            batchActionLabel: batchActionLabel,
            batch: batch,
            cardsCurrentBranchId: cardsCurrentBranchId
        }
    };
};
