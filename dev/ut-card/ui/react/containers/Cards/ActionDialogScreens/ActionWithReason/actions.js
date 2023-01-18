export const actionsList = {
    'TOGGLE_ACTION_WITH_REASON': Symbol('TOGGLE_ACTION_WITH_REASON'),
    'CHANGE_INPUT': Symbol('CHANGE_INPUT'),
    'CONFIRM_ACTION': Symbol('CONFIRM_ACTION'),
    'CLEAR': Symbol('CLEAR')
};

export function toggleActionWithReason() {
    return {
        type: actionsList.TOGGLE_ACTION_WITH_REASON
    };
};
export function changeInput(params) {
    return {
        type: actionsList.CHANGE_INPUT,
        params: params
    };
};
export function confirmAction(params) {
    return {
        type: actionsList.CONFIRM_ACTION,
        method: 'card.card.statusUpdate',
        params: {cardActionId: params.cardActionId, card: params.card}
    };
}
export function clear() {
    return {
        type: actionsList.CLEAR
    };
};
