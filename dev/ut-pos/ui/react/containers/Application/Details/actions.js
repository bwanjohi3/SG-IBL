export const actionList = {
    // main dialog actions
    ADD_APPLICATION: Symbol('ADD_APPLICATION'),
    EDIT_APPLICATION: Symbol('EDIT_APPLICATION'),
    SAVE_APPLICATION: Symbol('SAVE_APPLICATION'),
    CLOSE: Symbol('CLOSE'),
    // input fields actions - left
    SET_CURRENCY_PROFILE: Symbol('SET_CURRENCY_PROFILE'),
    // input fields actions - right
    SET_FIELD_VALUE: Symbol('SET_FIELD_VALUE'),
    CHANGE_FILE: Symbol('CHANGE_FILE'),
    SET_ERRORS: Symbol('SET_ERRORS')
};

// main dialog actions
export const addApplication = () => {
    return {
        type: actionList.ADD_APPLICATION
    };
};
export const editApplication = (appId) => {
    return {
        type: actionList.EDIT_APPLICATION,
        method: 'db/pos.application.get',
        reqId: Date.now(),
        params: {appId}
    };
};
export const saveApplication = (params, appId) => {
    // TODO: fix params to sp requirements
    let method = 'db/pos.application.add';
    let newParams = Object.assign({}, params);
    if (appId) {
        newParams = Object.assign(newParams, {appId});
        method = 'db/pos.application.edit';
    }
    return {
        method,
        type: actionList.SAVE_APPLICATION,
        params: {application: [newParams]}
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

export const changeFile = (attachment, index) => {
    return {
        type: actionList.CHANGE_FILE,
        attachment,
        index
    }
}
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
