export const actionsList = {
    'TOGGLE_CARD_UPDATE': Symbol('TOGGLE_CARD_UPDATE'),
    'UPDATE': Symbol('UPDATE'),
    'SET_ACCOUNT_ERRORS': Symbol('SET_ACCOUNT_ERRORS'),
    'ON_REASON_CHANGE': Symbol('ON_REASON_CHANGE')
};

export function toggleCardUpdate() {
    return {
        type: actionsList.TOGGLE_CARD_UPDATE
    };
};
export function update(params) {
    return {
        type: actionsList.UPDATE,
        method: 'card.cardInUse.statusUpdate',
        params: {
            cardActionId: params.cardActionId,
            card: params.card,
            account: params.accounts,
            attachment: params.attachment,
            newAttachments: params.newAttachments,
            document: params.document
        }
    };
}
export function setAccountErrors(errors) {
    return {
        type: actionsList.SET_ACCOUNT_ERRORS,
        params: {errors: errors}
    };
}
export function onReasonChange(params) {
    return {
        type: actionsList.ON_REASON_CHANGE,
        params: params
    };
};
