export const actionTypes = {
    'CLEAR_FILTERS': Symbol('CLEAR_FILTERS')
};

export function clearFilters() {
    return {
        type: actionTypes.CLEAR_FILTERS
    };
};
