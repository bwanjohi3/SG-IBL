export const actionsList = {
    'TOGGLE_CARD_DETAILS': Symbol('TOGGLE_CARD_DETAILS'),
    'FETCH_CARD': Symbol('FETCH_CARD')
};

export function toggleCardDetails() {
    return {
        type: actionsList.TOGGLE_CARD_DETAILS
    };
};

export function fetchCard(id) {
    return {
        type: actionsList.FETCH_CARD,
        method: 'card.cardInProduction.get',
        params: {cardId: id}
    };
};
