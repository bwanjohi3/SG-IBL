export const actionList = {
    'CLEAR_FILTERS': Symbol('CLEAR_FILTERS')
};

export function clearFilters() {
    return {
        type: actionList.CLEAR_FILTERS
    };
};
