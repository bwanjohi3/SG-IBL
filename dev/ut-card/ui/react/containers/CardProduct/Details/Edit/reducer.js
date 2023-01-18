import {fromJS} from 'immutable';
import * as actionTypes from './actionTypes';

const defaultState = fromJS({
    editItem: null,
    fetchedData: false,
    accountTypes: [],
    partnerTypes: [],
    isConfirmationOpen: false
});

const FINISHED = 'finished';

export const editCardProduct = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.EDIT_PRODUCT:
            return defaultState;
        case actionTypes.CHANGE_EDIT_ITEM_FIELD:
            return state.setIn(['editItem', action.params.field], fromJS(action.params.newValue));
        case actionTypes.FETCH_CARD_PRODUCT_BY_ID:
            if (action.methodRequestState === FINISHED && action.result) {
                return state
                    .set('fetchedData', true)
                    .setIn(['editItem'], fromJS(action.result.product[0]))
                    .setIn(['editItem', 'withoutEndDate'], !action.result.product[0].endDate)
                    .setIn(['editItem', 'shouldDisplayErrorText'], false)
                    .setIn(['editItem', 'productAccountType'], fromJS(action.result.accountType.map((accountType) => ({key: accountType.accountTypeId, name: accountType.accountTypeName}))))
                    .setIn(['editItem', 'productCustomerType'], fromJS(action.result.customerType.map((customerType) => ({key: customerType.customerTypeId, name: customerType.customerTypeName}))));
            }
            return state;
        case actionTypes.REMOVE_CARD_PRODUCT:
            return defaultState;
        case actionTypes.FETCH_ACCOUNT_TYPES:
            if (action.methodRequestState === FINISHED && action.result) {
                return state
                        .set('accountTypes', fromJS((action.result && action.result[0])));
            }
            return state;
        case actionTypes.OPEN_CONFIRMATION:
            return state.set('isConfirmationOpen', true);
        case actionTypes.CLOSE_CONFIRMATION:
            return state.set('isConfirmationOpen', false);
    }
    return state;
};
