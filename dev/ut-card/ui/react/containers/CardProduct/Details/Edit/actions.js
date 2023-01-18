import * as actionTypes from './actionTypes';

export const editProduct = (params) => {
    return {
        type: actionTypes.EDIT_PRODUCT,
        params: params,
        method: 'card.product.edit'
    };
};

export const changeEditItemField = (field, newValue) => ({
    type: actionTypes.CHANGE_EDIT_ITEM_FIELD,
    params: {field, newValue}
});

export const fetchCardProductById = (productId) => {
    return {
        type: actionTypes.FETCH_CARD_PRODUCT_BY_ID,
        params: {productId},
        method: 'card.product.get',
        suppressPreloadWindow: false
    };
};

export const fetchAccountTypes = () => ({
    type: actionTypes.FETCH_ACCOUNT_TYPES,
    method: 'card.accountType.list'
});

export const removeCardProduct = () => ({
    type: actionTypes.REMOVE_CARD_PRODUCT,
    suppressPreloadWindow: true
});

export const openConfirmation = () => ({
    type: actionTypes.OPEN_CONFIRMATION
});

export const closeConfirmation = () => ({
    type: actionTypes.CLOSE_CONFIRMATION
});
