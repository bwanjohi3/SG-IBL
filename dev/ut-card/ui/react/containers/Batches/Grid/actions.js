import * as actionTypes from './actionTypes.js';

export const fetch = (filterBy, orderBy, paging) => ({type: actionTypes.FETCH, params: { filterBy, orderBy, paging }, method: 'card.batch.fetch'});
export const downloadFile = (checkedIdx) => ({type: actionTypes.DOWNLOAD_FILE, checkedIdx: checkedIdx});
export const check = (rowIdx, row, currentState) => ({type: actionTypes.CHECK, params: {rowIdx, row, currentState}});
export const multiCheck = (currentState) => ({type: actionTypes.MULTI_CHECK, params: {currentState}});
export const checkSingle = (row) => ({type: actionTypes.CHECK_SINGLE, params: {row}});
export const fetchBusinessUnits = () => {
    return {
        type: actionTypes.FETCH_BUSINESS_UNITS,
        method: 'customer.organization.list',
        params: {}
    };
};
export const fetchCardProducts = (ownershipTypeId) => {
    return {
        type: actionTypes.FETCH_CARD_PRODUCTS,
        method: 'card.product.list',
        params: {
            isActive: 1,
            isValid: 1,
            ownershipTypeId
        }
    };
};
export const toggleColumn = (field) => ({type: actionTypes.TOGGLE_COLUMN, field});
export const setVisibleColumns = () => ({type: actionTypes.SET_VISIBLE_COLUMNS});
export const areAllCardsGeneratedUpdate = (params) => ({type: actionTypes.ARE_ALL_CARDS_GENERATED_UPDATE, params: params});
