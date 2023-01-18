export const actionList = {
    // main dialog actions
    ADD_BINLIST: Symbol('ADD_BINLIST'),
    EDIT_BINLIST: Symbol('EDIT_BINLIST'),
    SAVE_BINLIST: Symbol('SAVE_BINLIST'),
    CLOSE: Symbol('CLOSE'),
    // input fields actions - left
    SET_CURRENCY_PROFILE: Symbol('SET_CURRENCY_PROFILE'),
    // input fields actions - right
    SET_FIELD_VALUE: Symbol('SET_FIELD_VALUE'),
    SET_ERRORS: Symbol('SET_ERRORS'),
    FETCH_OPERATION: Symbol('FETCH_OPERATION'),
    FETCH_CARDBINLIST: Symbol('FETCH_CARDBINLIST'),
    FECTH_CARDPRODUCT: Symbol('FECTH_CARDPRODUCT')
};

// main dialog actions
export const addBinList = () => {
    return {
        type: actionList.ADD_BINLIST
    };
};
export const editBinList = (binListId) => {
    return {
        type: actionList.EDIT_BINLIST,
        method: 'db/pos.binList.get',
        reqId: Date.now(),
        params: {binListId}
    };
};
export const saveBinList = (params, binListId) => {
    // TODO: fix params to sp requirements
    let method = 'db/pos.binList.add';
    let newParams = Object.assign({}, params);
    if (binListId) {
        newParams = Object.assign(newParams, {binListId});
        method = 'db/pos.binList.edit';
    }
    return {
        method,
        type: actionList.SAVE_BINLIST,
        params: {binList: [newParams]}
    };
};
export const close = () => {
    return {type: actionList.CLOSE};
};
export const setFieldValue = (key, value) => {
    return {
        type: actionList.SET_FIELD_VALUE,
        key,
        value
    };
};


export const setExcludeButtons = (value) => {
    return {type: actionList.SET_EXCLUDE_BUTTONS, params: {actionVisibility: value}};
};

export const fetchBranches = () => ({
    type: actionList.FETCH_BRANCHES,
    method: 'db/pos.organization.list',
    params: {}
});

export const fetchOperations = () => ({
    type: actionList.FETCH_OPERATION,
    method: 'core.itemCode.fetch',
    params: {alias: ['operation']}
});

export const fetchCardProduct = () => ({
    type: actionList.FECTH_CARDPRODUCT,
    method: 'rule.item.fetch',
    params: {itemName:['cardProduct']}
});

export const fetchCardBinList = () => ({
    type: actionList.FETCH_CARDBINLIST,
    method: 'card.bin.fetch',
    params: {filterBy: {isActive: true}}
});

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
