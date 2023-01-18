export const actionList = {
    'CLEAR_FILTERS': Symbol('CLEAR_FILTERS_CARD_PRODUCT')
};

export function clearFilters() {
    return {
        type: actionList.CLEAR_FILTERS
    };
};
