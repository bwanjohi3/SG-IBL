export const actionList = {
    OPEN: Symbol('OPEN'),
    CLOSE: Symbol('CLOSE'),
    SET_BUSINESS_UNIT: Symbol('SET_BUSINESS_UNIT'),
    SET_ISSUING_UNIT: Symbol('SET_ISSUING_UNIT'),
    SET_CARD_TYPE: Symbol('SET_CARD_TYPE'),
    CREATE_NONAME_BATCH: Symbol('CREATE_NONAME_BATCH'),
    FETCH_CARD_TYPES: Symbol('FETCH_CARD_TYPES'),
    FETCH_BUSINESS_UNITS: Symbol('FETCH_BUSINESS_UNITS'),
    CHANGE_BATCH_NAME: Symbol('CHANGE_BATCH_NAME'),
    CHANGE_NUMBER_OF_CARDS: Symbol('CHANGE_NUMBER_OF_CARDS'),
    CLOSE_SUCCESS: Symbol('CLOSE_SUCCESS'),
    SET_ERRORS: Symbol('SET_ERRORS')
};

export const open = () => ({type: actionList.OPEN});
export const close = () => ({type: actionList.CLOSE});
export const setBusinessUnit = (value) => ({type: actionList.SET_BUSINESS_UNIT, value});
export const setIssuingUnit = (value) => ({type: actionList.SET_ISSUING_UNIT, value});
export const setCardType = (value) => ({type: actionList.SET_CARD_TYPE, value});
export const createNoNameBatch = (batch) => ({type: actionList.CREATE_NONAME_BATCH, method: 'card.batch.addNoNameBatch', params: {batch}});
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
export const fetchBusinessUnits = () => {
    return {
        type: actionList.FETCH_BUSINESS_UNITS,
        method: 'customer.organization.list',
        params: {}
    };
};
export const changeBatchName = (params) => ({type: actionList.CHANGE_BATCH_NAME, params});
export const changeNumberOfCards = (params) => ({type: actionList.CHANGE_NUMBER_OF_CARDS, params});
export const closeSuccess = () => ({type: actionList.CLOSE_SUCCESS});
export const setErrors = (params) => ({type: actionList.SET_ERRORS, params});
