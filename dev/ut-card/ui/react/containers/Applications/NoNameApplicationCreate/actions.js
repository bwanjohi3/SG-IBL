import * as actionTypes from './actionTypes';

export function createApplication(params) {
    return {
        type: actionTypes.CREATE_APPLICATION,
        method: 'card.noNameApplication.add',
        params
    };
}

export function changeProductId(params) {
    return {
        type: actionTypes.CHANGE_PRODUCTID,
        params
    };
}

export function changeIssueType(params) {
    return {
        type: actionTypes.CHANGE_ISSUETYPEID,
        params
    };
}

export function handleNoNameCreateDialogToggle() {
    return {
        type: actionTypes.TOGGLE_CREATE_NO_NAME_DIALOG
    };
}

export function searchCardNumber(cardNumber) {
    return {
        type: actionTypes.SEARCH_CARD_NUMBER,
        method: 'card.card.search',
        params: {
            cardNumber: cardNumber.trim()
        }
    };
}

export function searchCustomer(customerName, productId) {
    return {
        type: actionTypes.SEARCH_CUSTOMER_BY_NAME,
        method: 'card.customer.search',
        params: {
            customerName,
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

export function changeMakerComment(params) {
    return {
        type: actionTypes.CHANGE_MAKER_COMMENT,
        params
    };
}

export function cardIssueTypes(params) {
    return {
        type: actionTypes.FETCH_CARDISSUE_TYPES,
        method: 'card.issueType.fetch',
        suppressPreloadWindow: true
    };
}

export const setErrors = (params) => ({
    type: actionTypes.SET_ERRORS,
    params
});

export function fetchCardProducts(embossedTypeId) {
    return {
        type: actionTypes.FETCH_CARD_PRODUCTS,
        method: 'card.product.list',
        params: {
            isActive: 1,
            isValid: 1,
            embossedTypeId
        },
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
