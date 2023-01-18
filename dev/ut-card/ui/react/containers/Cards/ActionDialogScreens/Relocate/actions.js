export const actionsList = {
    'TOGGLE_CARD_RELOCATION': Symbol('TOGGLE_CARD_RELOCATION'),
    'SET': Symbol('SET'),
    'FETCH': Symbol('FETCH'),
    'RELOCATE': Symbol('RELOCATE'),
    'CLEAR': Symbol('CLEAR')
};

export function toggleCardRelocation() {
    return {
        type: actionsList.TOGGLE_CARD_RELOCATION
    };
};
export function set(data) {
    return {
        type: actionsList.SET,
        params: {businessUnitId: data.value}
    };
};
export function fetch() {
    return {
        type: actionsList.FETCH,
        method: 'customer.organization.list',
        params: {}
    };
};
export function relocate(params) {
    return {
        type: actionsList.RELOCATE,
        method: 'card.card.statusUpdate',
        params: {cardActionId: params.cardActionId, card: params.card}
    };
};
export function clear() {
    return {
        type: actionsList.CLEAR
    };
};
