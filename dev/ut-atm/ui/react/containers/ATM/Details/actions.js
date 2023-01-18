export const actionList = {
    // main dialog actions
    ADD_ATM: Symbol('ADD_ATM'),
    EDIT_ATM: Symbol('EDIT_ATM'),
    SAVE_ATM: Symbol('SAVE_ATM'),
    CLOSE: Symbol('CLOSE'),
    // input fields actions - left
    SET_CURRENCY_PROFILE: Symbol('SET_CURRENCY_PROFILE'),
    FETCH_BRANCHES: Symbol('FETCH_BRANCHES'),
    // input fields actions - right
    SET_FIELD_VALUE: Symbol('SET_FIELD_VALUE'),
    SET_ERRORS: Symbol('SET_ERRORS')
};

// main dialog actions
export const addAtm = () => {
    return {
        type: actionList.ADD_ATM
    };
};
export const editAtm = (atmId) => {
    return {
        type: actionList.EDIT_ATM,
        method: 'db/atm.terminal.fetch',
        reqId: Date.now(),
        params: {atmId}
    };
};
export const saveAtm = (params, atmId) => {
    // TODO: fix params to sp requirements
    let method = 'db/atm.terminal.add';
    let newParams = Object.assign({}, params);
    if (atmId) {
        newParams = Object.assign(newParams, {actorId: atmId});
        method = 'db/atm.terminal.edit';
    }

    return {
        method,
        type: actionList.SAVE_ATM,
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
    method: 'db/atm.organization.list',
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
