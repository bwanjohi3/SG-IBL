import immutable from 'immutable';
import * as actionTypes from './actionTypes';
import { methodRequestState } from './../../constants';

const defaultCardsApplicationsCreate = immutable.fromJS({
    open: false,
    created: false,
    errors: {},
    cardNumber: '',
    cardId: '',
    cardTypes: [],
    issueTypeId: 0,
    issueTypes: [],
    typeId: 0,
    cardProducts: [],
    productId: 0,
    customerName: '',
    customerNumber: '',
    customersOpen: false,
    customers: [],
    personName: '',
    personNumber: '',
    mobileNumber: '',
    personId: '',
    personsOpen: false,
    persons: [],
    makerComments: ''
});

const invalidCardNumberMessage = 'Invalid Card Number';

export function cardNoNameApplicationCreate(state = defaultCardsApplicationsCreate, action) {
    switch (action.type) {
        case actionTypes.TOGGLE_CREATE_NO_NAME_DIALOG:
            let newOpenedState = !state.get('open');
            return defaultCardsApplicationsCreate.set('open', newOpenedState);
        case actionTypes.FETCH_CARD_PRODUCTS:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let products = immutable.fromJS(
                    action.result.product.map((value) => {
                        return {
                            key: value.productId,
                            name: value.name,
                            accountLinkLimit: value.accountLinkLimit
                        };
                    })
                );
                return state
                    .set('cardProducts', products);
            }
            return state;
        case actionTypes.FETCH_CARDISSUE_TYPES:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let issueTypes = immutable.fromJS(
                    action.result.allIssueTypes.map((value) => {
                        return {
                            key: value.issueTypeId,
                            name: value.issueName
                        };
                    })
                );
                return state
                    .set('issueTypes', issueTypes);
            }
            return state;
        case actionTypes.CREATE_APPLICATION:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                return defaultCardsApplicationsCreate.set('created', true);
            }
            break;
        case actionTypes.CHANGE_PRODUCTID:
            return state
                .set('productId', action.params.value);
       case actionTypes.CHANGE_ISSUETYPEID:
            return state
                .set('issueTypeId', action.params.value);
        case actionTypes.SEARCH_CARD_NUMBER:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let data = action.result[0][0];
                if (!data) {
                    return state
                        .set('cardNumber', action.params.cardNumber)
                        .set('cardTypes', defaultCardsApplicationsCreate.get('cardTypes'))
                        .set('typeId', defaultCardsApplicationsCreate.get('typeId'))
                        .set('cardId', defaultCardsApplicationsCreate.get('cardId'))
                        .setIn(['errors', 'cardId'], invalidCardNumberMessage);
                }

                let types = immutable.fromJS([{
                    key: data.typeId,
                    name: data.typeName,
                    accountLinkLimit: data.accountLinkLimit
                }]);

                return state
                    .set('cardNumber', action.params.cardNumber)
                    .set('cardTypes', types)
                    .set('typeId', data.typeId)
                    .set('cardId', data.cardId)
                    .deleteIn(['errors', 'cardId'])
                    .deleteIn(['errors', 'typeId']);
            }
            break;
        case actionTypes.SEARCH_CUSTOMER_BY_NAME:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let customers = immutable.fromJS(action.result.customer);
                return state
                    .set('customerName', action.params.customerName)
                    .set('customers', customers)
                    .set('customersOpen', true)
                    .set('personName', defaultCardsApplicationsCreate.get('personName'))
                    .set('personNumber', defaultCardsApplicationsCreate.get('personNumber'))
                    .set('personId', defaultCardsApplicationsCreate.get('personId'));
            }
            break;
        case actionTypes.CHOOSE_CUSTOMER_FROM_LIST:
            return state
                .set('customersOpen', false)
                .set('customerName', action.params.customerName)
                .set('customerNumber', action.params.customerNumber)
                .set('mobileNumber', action.params.telMobile)
                .deleteIn(['errors', 'customerName']);
        case actionTypes.CLOSE_CUSTOMERS_POPUP:
            return state
                .set('customersOpen', false);
        case actionTypes.SEARCH_PERSON_BY_NUMBER:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let persons = immutable.fromJS(action.result.person);
                return state
                    .set('persons', persons)
                    .set('personsOpen', true)
                    .set('personName', action.params.personName || '')
                    .set('personNumber', defaultCardsApplicationsCreate.get('personNumber'))
                    .deleteIn(['errors', 'personName']);
            }
            break;
        case actionTypes.CHOOSE_PERSON_FROM_LIST:
            return state
                .set('personsOpen', false)
                .set('personNumber', action.params.personNumber)
                .set('personName', action.params.personName)
                .set('personId', action.params.personId)
                .deleteIn(['errors', 'personName'])
                .deleteIn(['errors', 'personNumber']);
        case actionTypes.CLOSE_PERSONS_POPUP:
            return state
                .set('personsOpen', false);
        case actionTypes.CHANGE_MAKER_COMMENT:
            return state
                .set('makerComments', action.params.value);
        case actionTypes.SET_ERRORS:
            let newErrorsImmutable = immutable.fromJS(action.params.form);
            return state
                .mergeDeepIn(['errors'], newErrorsImmutable)
                .updateIn(['personName'], (pn) => {
                    return newErrorsImmutable.get('personName') ? '' : pn;
                })
                .updateIn(['customerName'], (cn) => {
                    return newErrorsImmutable.get('customerName') ? '' : cn;
                });
    }

    return state;
}
