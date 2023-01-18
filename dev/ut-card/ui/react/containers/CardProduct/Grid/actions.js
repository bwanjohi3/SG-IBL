import * as actionTypes from './actionTypes';

export const fetch = (filterBy = {}, orderBy = {}, paging = {}) => ({
    type: actionTypes.FETCH,
    method: 'card.product.fetch',
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
    type: actionTypes.REFETCH
});

export const updatePagination = (params) => ({
    type: actionTypes.UPDATE_PAGINATION,
    params: params
});

export const toggleProductStatus = (params) => {
    return {
        type: actionTypes.TOGGLE_PRODUCT_STATUS,
        method: 'card.product.statusUpdate',
        params: {
            product: params.map(product => ({ productId: product.productId, isActive: !product.isActive }))
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
