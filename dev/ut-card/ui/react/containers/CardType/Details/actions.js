import * as actionTypes from './actionTypes';

export const setEditMode = (params) => {
    return {
        type: actionTypes.SET_EDIT_MODE,
        params: {
            typeId: params.typeId
        }
    };
};

export const fetchCardTypeById = (params) => {
    return {
        type: actionTypes.FETCH_CARD_TYPE_BY_ID,
        method: 'card.type.get',
        params: {
            typeId: params.typeId
        }
    };
};

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

export const fetchBinTypes = (params) => ({
    type: actionTypes.FETCH_BIN_TYPES,
    method: 'card.bin.list',
    params: {
        isActive: 1,
        skipUsed: params.skipUsedBinTypes
    }
});

export const fetchCdol1Profiles = (params) => ({
    type: actionTypes.FETCH_CDOL1_PROFILES,
    method: 'card.cdol1Profile.list',
    params: {}
});

export const updateSingleValue = (params) => {
    return {
        type: actionTypes.UPDATE_SINGLE_VALUE,
        params
    };
};

export const updateGenerateControlDigit = (params) => {
    return {
        type: actionTypes.UPDATE_GENERATE_CONTROL_DIGIT,
        params
    };
};

export const updateMultiValue = (params) => {
    return {
        type: actionTypes.UPDATE_MULTI_VALUE,
        params
    };
};

export const setErrors = (params) => {
    return {
        type: actionTypes.SET_ERRORS,
        params
    };
};

// export const fetchBusinessUnits = () => ({
//     type: actionTypes.FETCH_BUSINESS_UNITS,
//     method: 'customer.organization.graphFetch',
//     suppressPreloadWindow: true,
//     params: {}
// });

export const toggleCreateCardTypePopup = () => ({
    type: actionTypes.TOGGLE_CREATE_CARD_TYPE_POPUP
});

export const createType = (params) => {
    return {
        type: actionTypes.CREATE_TYPE,
        params: {
            type: params.cardTypeData,
            binId: params.binData
        },
        method: 'card.type.add'
    };
};

export const resetState = () => {
    return {
        type: actionTypes.RESET_STATE
    };
};

export const fetchCipher = () => ({
    type: actionTypes.FETCH_CIPHER,
    method: 'card.cipher.list',
    params: {},
    suppressPreloadWindow: true
});

export const fetchEmvTags = () => {
    return {
        type: actionTypes.FETCH_EMV_TAGS,
        method: 'card.emvTags.list',
        params: {}
    };
};
