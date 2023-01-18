export const actionList = {
    // main dialog actions
    ADD_POS: Symbol('ADD_POS'),
    EDIT_POS: Symbol('EDIT_POS'),
    SAVE_POS: Symbol('SAVE_POS'),
    CLOSE: Symbol('CLOSE'),
    // input fields actions - left
    SET_CURRENCY_PROFILE: Symbol('SET_CURRENCY_PROFILE'),
    FETCH_BRANCHES: Symbol('FETCH_BRANCHES'),
    FETCH_KEYS: Symbol('FETCH_KEYS'),
    FETCH_FW: Symbol('FETCH_FW'),
    // input fields actions - right
    SET_FIELD_VALUE: Symbol('SET_FIELD_VALUE'),
    SET_ERRORS: Symbol('SET_ERRORS')
};

// main dialog actions
export const addPos = () => {
    return {
        type: actionList.ADD_POS
    };
};
export const editPos = (terminalId) => {
    return {
        type: actionList.EDIT_POS,
        method: 'db/pos.terminal.get',
        reqId: Date.now(),
        params: {terminalId}
    };
};
export const savePos = (params, terminalId) => {
    // TODO: fix params to sp requirements
    let method = 'db/pos.terminal.add';
    let newParams = Object.assign({}, params);
    if (terminalId) {
        newParams = Object.assign(newParams, {actorId: terminalId});
        method = 'db/pos.terminal.edit';
    }

    return {
        method,
        type: actionList.SAVE_POS,
        params: {terminal: [newParams]}
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
// input fields actions - left
// cassettes
// end cassettes

export const setExcludeButtons = (value) => {
    return {type: actionList.SET_EXCLUDE_BUTTONS, params: {actionVisibility: value}};
};

export const fetchBranches = () => ({
    type: actionList.FETCH_BRANCHES,
    method: 'db/pos.organization.list',
    params: {}
});

export const fetchKeys = () => ({
    type: actionList.FETCH_KEYS,
    method: 'db/pos.keyChain.list',
    params: {}
});

export const fetchFirmware = () => ({
    type: actionList.FETCH_FW,
    method: 'db/pos.application.list',
    params: {}
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
