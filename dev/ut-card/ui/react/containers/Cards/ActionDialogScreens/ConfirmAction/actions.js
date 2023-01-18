export const actionsList = {
    'TOGGLE_ACTION_CONFIRM_PROMPT': Symbol('TOGGLE_ACTION_CONFIRM_PROMPT'),
    'CONFIRM_ACTION': Symbol('CONFIRM_ACTION')
};

export function toggleActionConfirmPrompt() {
    return {
        type: actionsList.TOGGLE_ACTION_CONFIRM_PROMPT
    };
};
export function confirmAction(params) {
    return {
        type: actionsList.CONFIRM_ACTION,
        method: 'card.card.statusUpdate',
        params: {cardActionId: params.cardActionId, cardActionLabel: params.cardActionLabel, card: params.card}
    };
}
