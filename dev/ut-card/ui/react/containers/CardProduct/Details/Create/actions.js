import * as actionTypes from './actionTypes';

export const fetchOwnershipTypes = () => ({
    type: actionTypes.FETCH_OWNERSHIP_TYPES,
    method: 'card.ownershipType.fetch',
    params: {}
});

export const fetchPartnerTypes = () => ({
    type: actionTypes.FETCH_PARTNER_TYPES,
    method: 'transfer.partner.list',
    params: {}
});

export const fetchCardBrands = () => ({
    type: actionTypes.FETCH_CARD_BRANDS,
    method: 'card.brand.fetch',
    params: {}
});

export const fetchCardNumberConstruction = () => ({
    type: actionTypes.FETCH_CARD_NUMBER_CONSTRUCTION,
    method: 'card.cardNumberConstruction.fetch',
    params: {}
});

export const fetchBinTypes = () => ({
    type: actionTypes.FETCH_BIN_TYPES,
    method: 'card.bin.fetch',
    params: {
        filterBy: {
            isActive: 1
        }
    }
});

export const fetchPeriodicCardFee = () => ({
    type: actionTypes.FETCH_CARD_FEES,
    method: 'card.periodicCardFee.fetch',
    params: {}
});

export const fetchBusinessUnits = () => ({
    type: actionTypes.FETCH_BUSINESS_UNITS,
    method: 'customer.organization.graphFetch',
    suppressPreloadWindow: true,
    params: {}
});

export const fetchCustomerTypes = () => ({
    type: actionTypes.FETCH_CUSTOMER_TYPES,
    method: 'card.customerType.list',
    suppressPreloadWindow: true
});

export const fetchAccountTypes = () => ({
    type: actionTypes.FETCH_ACCOUNT_TYPES,
    method: 'card.accountType.list',
    suppressPreloadWindow: true
});

export const toggleCreateCardProductPopup = () => ({
    type: actionTypes.TOGGLE_CREATE_CARD_PRODUCT_POPUP
});

export const createProduct = (params) => {
    let {productCustomerType, productAccountType} = params;
    productAccountType = productAccountType.map((type) => { return {accountTypeId: type.key}; });
    productCustomerType = productCustomerType.map((type) => { return {customerTypeId: type.key}; });
    delete params.productCustomerType;
    delete params.productAccountType;

    return {
        type: actionTypes.CREATE_PRODUCT,
        params: {
            product: params,
            productCustomerType: productCustomerType,
            productAccountType: productAccountType
        },
        method: 'card.product.add'
    };
};

export const fetchCipher = () => ({
    type: actionTypes.FETCH_CIPHER,
    method: 'card.cipher.list',
    params: {},
    suppressPreloadWindow: true
});
