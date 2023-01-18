export const actionList = {
    FETCH: Symbol('FETCH'),
    CLEANUP_CHECKED: Symbol('CLEANUP_CHECKED'),
    CHECK: Symbol('CHECK'),
    MULTI_CHECK: Symbol('MULTI_CHECK'),
    TOGGLE_COLUMN: Symbol('TOGGLE_COLUMN'),
    SET_VISIBLE_COLUMNS: Symbol('SET_VISIBLE_COLUMNS')
};

export const fetch = (filterBy, orderBy, paging) => ({type: actionList.FETCH, params: {filterBy, orderBy, paging}, method: 'card.cardInUse.fetch'});
export const check = (rowIdx, row, state) => ({type: actionList.CHECK, params: {rowIdx, row, state}});
export const cleanAndCheck = (rowIdx, row, state) => ({type: actionList.CHECK, params: {rowIdx, row, state, cleanup: true}});
export const cleanChecked = () => ({type: actionList.CLEANUP_CHECKED});
export const multiCheck = (currentState) => ({type: actionList.MULTI_CHECK, params: {currentState}});
export const toggleColumn = (field) => ({type: actionList.TOGGLE_COLUMN, field});
export const setVisibleColumns = () => ({type: actionList.SET_VISIBLE_COLUMNS});
