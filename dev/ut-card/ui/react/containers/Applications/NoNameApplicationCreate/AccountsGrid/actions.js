import * as actionTypes from './actionTypes';

export const searchAccounts = (customerNumber, personNumber, productId) => ({
    type: actionTypes.FETCH_ACCOUNTS,
    method: 'card.account.search',
    params: {
        customerNumber,
        personNumber,
        productId
    }
});

export const searchAccountsTSS = (customerNumber, personNumber, productId) => ({
    type: actionTypes.FETCH_ACCOUNTS,
    method: 'card.account.searchTSS',
    params: {
        customerNumber,
        personNumber,
        productId
    }
});

export const link = (cardId, accountId, id, record) => ({
    type: actionTypes.ADD,
    params: {
        cardId,
        accountId,
        id,
        record
    }
});

export const unLink = (cardId, accountId, id) => ({
    type: actionTypes.DELETE,
    params: {
        cardId,
        accountId,
        id
    }
});

export const setDefault = (cardId, accountId, id, currency) => ({
    type: actionTypes.SET_DEFAULT,
    params: {
        cardId,
        accountId,
        id,
        currency
    }
});

export const clear = () => ({
    type: actionTypes.CLEAR
});
