import * as actionTypes from './actionTypes';

export const fetch = (filterBy = {}, orderBy = {}, paging = {}) => ({
    type: actionTypes.FETCH,
    method: 'card.type.fetch',
    params: {filterBy, orderBy, paging}
});

export const check = (params) => ({
    type: actionTypes.CHECK,
    params
});
export const selectItem = (record) => ({
    type: actionTypes.CHECK,
    params: {record}
});

export const multiCheck = (params) => ({
    type: actionTypes.MULTI_CHECK,
    params
});

export const refetch = () => ({
    type: actionTypes.REFETCH_CARD_TYPES
});

export const updatePagination = (params) => ({
    type: actionTypes.UPDATE_PAGINATION,
    params: params
});

export const toggleTypeStatus = (params) => {
    return {
        type: actionTypes.TOGGLE_TYPE_STATUS,
        method: 'card.type.statusUpdate',
        params: {
            type: params.map(type => ({ typeId: type.typeId, isActive: !type.isActive }))
        }
    };
};
export function toggleColumn(field) {
    return {
        type: actionTypes.TOGGLE_COLUMN,
        field
    };
};
export function setVisibleColumns() {
    return {
        type: actionTypes.SET_VISIBLE_COLUMNS
    };
};
