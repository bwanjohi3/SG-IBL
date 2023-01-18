export const actionList = {
    'CLEAR_FILTERS': Symbol('CLEAR_FILTERS_CARD_TYPE')
};

export function clearFilters() {
    return {
        type: actionList.CLEAR_FILTERS
    };
};
