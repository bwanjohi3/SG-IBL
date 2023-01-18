import immutable from 'immutable';
import * as actionTypes from './actionTypes';
import {methodRequestState} from './../../constants';
import {updateError} from './../helpers';

const defaultCardsApplicationsCreate = immutable.fromJS({
    open: false,
    created: false,
    errors: {},
    customer: {
        customersOpen: false,
        customerName: '',
        customerNumber: '',
        customerId: '',
        customers: []
    },
    person: {
        personsOpen: false,
        personNumber: '',
        personName: '',
        personId: '',
        persons: []
    },
    units: {
        businessUnits: [],
        targetBranchId: '',
        issuingBranchId: ''
    },
    product: {
        cardProducts: [],
        productId: ''
    },
    type: {
        cardTypes: [],
        typeId: ''
    },
    cardholder: {
        cardholderName: ''
    },
    makerComments: '',
    attachments: []
});

export function cardNameApplicationCreate(state = defaultCardsApplicationsCreate, action) {
    switch (action.type) {
        case actionTypes.TOGGLE_CREATE_DIALOG:
            let newOpenedState = !state.get('open');
            return defaultCardsApplicationsCreate.set('open', newOpenedState);
        case actionTypes.CREATE_APPLICATION:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                return defaultCardsApplicationsCreate.set('created', true);
            }
            break;
        case actionTypes.FETCH_BUSINESS_UNITS:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let units = action.result.allBranches.map(function(branch) {
                    return {key: branch.actorId, name: branch.organizationName};
                });
                return state.setIn(['units', 'businessUnits'], immutable.fromJS(units));
            }
            break;
        case actionTypes.FETCH_CARD_TYPES:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let types = action.result.type.map(function(type) {
                    return {key: type.typeId, name: type.name};
                });
                return state.setIn(['type', 'cardTypes'], immutable.fromJS(types));
            }
            return state;
        case actionTypes.FETCH_CARD_PRODUCTS:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let products = action.result.product.map(function(product) {
                    return {key: product.productId, name: product.name, accountLinkLimit: product.accountLinkLimit};
                });

                return state.setIn(['product', 'cardProducts'], immutable.fromJS(products));
            }
            return state;
        case actionTypes.SEARCH_CUSTOMER_BY_NAME:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                return state
                    .setIn(['customer', 'customerName'], action.params.customerName)
                    .setIn(['customer', 'customers'], immutable.fromJS(action.result.customer))
                    .setIn(['customer', 'customersOpen'], true)
                    .setIn(['cardholder', 'cardholderName'], defaultCardsApplicationsCreate.getIn(['cardholder', 'cardholderName']))
                    .set('person', defaultCardsApplicationsCreate.get('person'));
            }
            break;
        case actionTypes.CHOOSE_CUSTOMER_FROM_LIST:
            return state
                .setIn(['customer', 'customersOpen'], false)
                .setIn(['customer', 'customerName'], action.params.customerName)
                .setIn(['customer', 'customerNumber'], action.params.customerNumber)
                .deleteIn(['errors', 'customerName']);
        case actionTypes.CLOSE_CUSTOMERS_POPUP:
            return state
                .setIn(['customer', 'customersOpen'], false);
        case actionTypes.SEARCH_PERSON_BY_NUMBER:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let persons = immutable.fromJS(action.result.person);
                return state
                    .setIn(['person', 'persons'], persons)
                    .setIn(['person', 'personsOpen'], true)
                    .setIn(['person', 'personName'], action.params.personName || '')
                    .setIn(['person', 'personNumber'], defaultCardsApplicationsCreate.getIn(['person', 'personNumber']))
                    .deleteIn(['errors', 'personName']);
            }
            break;
        case actionTypes.CHOOSE_PERSON_FROM_LIST:
            return state
                .setIn(['person', 'personsOpen'], false)
                .setIn(['person', 'personNumber'], action.params.personNumber)
                .setIn(['person', 'personName'], action.params.personName)
                .setIn(['cardholder', 'cardholderName'], action.params.personName)
                .deleteIn(['errors', 'personName'])
                .deleteIn(['errors', 'personNumber'])
                .deleteIn(['errors', 'cardholderName']);
        case actionTypes.CLOSE_PERSONS_POPUP:
            return state
                .setIn(['person', 'personsOpen'], false);
        case actionTypes.CHANGE_BUSINESS_UNIT:
            return state
                .setIn(['units', 'targetBranchId'], action.params.value)
                .deleteIn(['errors', action.params.key]);
        case actionTypes.CHANGE_ISSUING_BUSINESS_UNIT:
            return state
                .setIn(['units', 'issuingBranchId'], action.params.value)
                .deleteIn(['errors', action.params.key]);
        case actionTypes.CHANGE_FILE:
            let first = immutable.fromJS(action.params);
            return state.setIn(['attachments', '0'], first);
        case actionTypes.CHANGE_CARD_PRODUCT:
            return state
                .setIn(['product', 'productId'], action.params.value)
                .deleteIn(['errors', action.params.key]);
        case actionTypes.CHANGE_CARD_TYPE:
            return state
                .setIn(['type', 'typeId'], action.params.value)
                .deleteIn(['errors', action.params.key]);
        case actionTypes.CHANGE_CARDHOLDER_NAME:
            let newErrors = updateError(action, state.get('errors'));
            return state
                .setIn(['cardholder', 'cardholderName'], action.params.value.toUpperCase())
                .set('errors', newErrors);
        case actionTypes.CHANGE_MAKER_COMMENT:
            return state
                .set('makerComments', action.params.value);
        case actionTypes.SET_ERRORS:
            let newErrorsImmutable = immutable.fromJS(action.params.form);
            return state
                .mergeDeepIn(['errors'], newErrorsImmutable)
                .updateIn(['person', 'personName'], (pn) => {
                    return newErrorsImmutable.get('personName') ? '' : pn;
                })
                .updateIn(['customer', 'customerName'], (cn) => {
                    return newErrorsImmutable.get('customerName') ? '' : cn;
                });
    }

    return state;
}
