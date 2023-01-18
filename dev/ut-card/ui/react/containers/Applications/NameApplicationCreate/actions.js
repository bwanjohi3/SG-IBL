import * as actionTypes from './actionTypes';

export function createApplication(params) {
    return {
        type: actionTypes.CREATE_APPLICATION,
        method: 'card.application.add',
        params
    };
}

export function handleNameDialogToggle() {
    return {
        type: actionTypes.TOGGLE_CREATE_DIALOG
    };
}

export function fetchBusinessUnits() {
    return {
        type: actionTypes.FETCH_BUSINESS_UNITS,
        method: 'customer.organization.list',
        params: {},
        suppressPreloadWindow: true
    };
}

export function fetchDocumentTypes() {
    return {
        type: actionTypes.FETCH_DOCUMENT_TYPES,
        method: 'card.documentType.list',
        suppressPreloadWindow: true
    };
}

export function fetchCardTypes(ownershipTypeId) {
    return {
        type: actionTypes.FETCH_CARD_TYPES,
        method: 'card.type.list',
        params: {
            isActive: 1,
            ownershipTypeId
        },
        suppressPreloadWindow: true
    };
}

export function fetchCardProducts(embossedTypeId, ownershipTypeId) {
    return {
        type: actionTypes.FETCH_CARD_PRODUCTS,
        method: 'card.product.list',
        params: {
            isActive: 1,
            embossedTypeId,
            ownershipTypeId
        },
        suppressPreloadWindow: true
    };
}

export function searchCardNumber(params) {
    return {
        type: actionTypes.SEARCH_CARD_NUMBER,
        params,
        result: {
            isValid: true
        }
    };
}

export function searchCustomer(customerNumber, productId) {
    return {
        type: actionTypes.SEARCH_CUSTOMER_BY_NAME,
        method: 'card.customer.search',
        params: {
            customerNumber,
            productId
        }
    };
}

export function searchCustomerTSS(customerNumber, productId) {
    return {
        type: actionTypes.SEARCH_CUSTOMER_BY_NAME,
        method: 'card.customer.searchTSS',
        params: {
            customerNumber,
            productId
        }
    };
}

export function closeCustomersPopup() {
    return {
        type: actionTypes.CLOSE_CUSTOMERS_POPUP
    };
}

export function chooseCustomerFromList(params) {
    return {
        type: actionTypes.CHOOSE_CUSTOMER_FROM_LIST,
        params
    };
}

export function searchPerson(customerNumber, personName) {
    return {
        type: actionTypes.SEARCH_PERSON_BY_NUMBER,
        method: 'card.person.search',
        params: {
            customerNumber,
            personName
        }
    };
}

export function searchPersonTSS(customerNumber, personName) {
    return {
        type: actionTypes.SEARCH_PERSON_BY_NUMBER,
        method: 'card.person.searchTSS',
        params: {
            customerNumber,
            personName
        }
    };
}

export function closePersonsPopup() {
    return {
        type: actionTypes.CLOSE_PERSONS_POPUP
    };
}

export function choosePersonFromList(params) {
    return {
        type: actionTypes.CHOOSE_PERSON_FROM_LIST,
        params
    };
}

export function fetchAccounts(personNumber) {
    return {
        type: actionTypes.FETCH_ACCOUNTS,
        method: 'card.account.search',
        params: {
            personNumber
        }
    };
}

export function fetchAccountsMambu(personNumber) {
    return {
        type: actionTypes.FETCH_ACCOUNTS,
        method: 'card.account.search',
        params: {
            personNumber
        }
    };
}

export function changeBusinessUnit(params) {
    return {
        type: actionTypes.CHANGE_BUSINESS_UNIT,
        params
    };
}

export function changeIssuingBusinessUnit(params) {
    return {
        type: actionTypes.CHANGE_ISSUING_BUSINESS_UNIT,
        params
    };
}
export function changeCardProduct(params) {
    return {
        type: actionTypes.CHANGE_CARD_PRODUCT,
        params
    };
}
export function changeCardType(params) {
    return {
        type: actionTypes.CHANGE_CARD_TYPE,
        params
    };
}

export function changeCardholderName(params) {
    return {
        type: actionTypes.CHANGE_CARDHOLDER_NAME,
        params
    };
}

export function changeMakerComment(params) {
    return {
        type: actionTypes.CHANGE_MAKER_COMMENT,
        params
    };
}

export const setErrors = (params) => ({
    type: actionTypes.SET_ERRORS,
    params
});

export const changeFile = (params) => {
    return {
        type: actionTypes.CHANGE_FILE,
        params
    };
};
