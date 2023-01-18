import {Map, List, fromJS} from 'immutable';
import * as actionTypes from './actionTypes';

const defaultState = Map({
    periodicCardFee: List(),
    organizations: List(),
    customerTypes: List(),
    accountTypes: List(),
    accountLinkLimit: undefined,
    pinRetriesLimit: undefined,
    isOpen: false
});

const FINISHED = 'finished';

export const createCardProduct = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.FETCH_ACCOUNT_TYPES:
            if (action.methodRequestState === FINISHED && action.result) {
                return state
                        .set('accountTypes', fromJS(action.result[0]));
            }
            return state;
        case actionTypes.FETCH_CUSTOMER_TYPES:
            if (action.methodRequestState === FINISHED && action.result) {
                return state
                    .set('customerTypes', fromJS(action.result[0]));
            }
            return state;
        case actionTypes.FETCH_CARD_FEES:
            if (action.methodRequestState === FINISHED && action.result) {
                return state
                    .set('periodicCardFee', fromJS(action.result.periodicCardFee));
            }
            return state;
        case actionTypes.FETCH_BUSINESS_UNITS:
            if (action.methodRequestState === FINISHED && action.result) {
                return state.set('organizations', fromJS(action.result.organization));
            }
            return state;
        case actionTypes.TOGGLE_CREATE_CARD_PRODUCT_POPUP:
            return state
                .update('isOpen', (value) => (!value));
        case actionTypes.CREATE_PRODUCT:
            return state;
        case actionTypes.FETCH_CIPHER:
            if (action.methodRequestState === FINISHED && action.result) {
                return state
                    .set('cipherList', fromJS(action.result.ciphers));
            }
            break;
    }
    return state;
};
