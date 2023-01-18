export const actionList = {
    FETCH_CARD_TYPES: Symbol('FETCH_CARD_TYPES'),
    // business unit actions
    SET_TARGET_BUSINESS_UNIT: Symbol('SET_TARGET_BUSINESS_UNIT'),
    SET_ISSUING_BUSINESS_UNIT: Symbol('SET_ISSUING_BUSINESS_UNIT'),
    // card type actions
    SET_CARD_TYPE: Symbol('SET_CARD_TYPE'),
    // input fields actions
    SET_BATCH_NAME: Symbol('SET_BATCH_NAME'),
    SET_NUMBER_OF_CARDS: Symbol('SET_NUMBER_OF_CARDS'),

    OPEN: Symbol('OPEN'),
    DOWNLOAD: Symbol('DOWNLOAD'),
    ARE_ALL_CARDS_GENERATED_UPDATE: Symbol('ARE_ALL_CARDS_GENERATED_UPDATE'),
    CLOSE: Symbol('CLOSE'),
    SET_EXCLUDE_BUTTONS: Symbol('SET_EXCLUDE_BUTTONS'),

    TOGGLE_REJECT: Symbol('TOGGLE_REJECT'),
    SET_ERRORS: Symbol('SET_ERRORS'),

    SET_CARDS_AUTO_ALLOCATION_BUSINESS_UNIT: Symbol('SET_CARDS_AUTO_ALLOCATION_BUSINESS_UNIT')
};

export const fetchCardTypes = (embossedTypeId, ownershipTypeId) => {
    return {
        type: actionList.FETCH_CARD_TYPES,
        method: 'card.type.list',
        params: {
            isActive: 1,
            isValid: 1,
            embossedTypeId,
            ownershipTypeId
        }
    };
};

// business unit actions
export const setTargetBusinessUnit = (businessUnitId) => {
    return {
        type: actionList.SET_TARGET_BUSINESS_UNIT,
        params: {
            businessUnitId: businessUnitId
        }
    };
};
export const setIssuingBusinessUnit = (businessUnitId) => {
    return {
        type: actionList.SET_ISSUING_BUSINESS_UNIT,
        params: {
            businessUnitId: businessUnitId
        }
    };
};
// card type actions
export const setTypeId = (typeId) => {
    return {
        type: actionList.SET_CARD_TYPE,
        params: {
            typeId: typeId
        }
    };
};
// input fields actions
export const setBatchName = (params) => {
    return {
        type: actionList.SET_BATCH_NAME,
        params: params
    };
};
export const setNumberOfCards = (params) => {
    return {
        type: actionList.SET_NUMBER_OF_CARDS,
        params: params
    };
};

export const open = (batchId) => {
    return {
        type: actionList.OPEN,
        params: {
            batchId: batchId
        },
        method: 'card.batch.get'
    };
};
export const download = () => {
    return {type: actionList.DOWNLOAD};
};
export const areAllCardsGeneratedUpdate = (params) => {
    return {
        type: actionList.ARE_ALL_CARDS_GENERATED_UPDATE,
        params: params
    };
};

export const close = (record) => {
    return {type: actionList.CLOSE};
};
export const setExcludeButtons = (value) => {
    return {type: actionList.SET_EXCLUDE_BUTTONS, params: {actionVisibility: value}};
};

export const toggleReject = (record, newValue) => {
    return {
        type: actionList.TOGGLE_REJECT,
        params: {
            record,
            newValue
        }
    };
};
export const setErrors = (params) => {
    return {
        type: actionList.SET_ERRORS,
        params
    };
};
export const setCardsAutoAllocationBusinessUnit = (params) => {
    return {
        type: actionList.SET_CARDS_AUTO_ALLOCATION_BUSINESS_UNIT,
        params
    };
};
