export const actionList = {
    'SET_FIELD': Symbol('SET_FIELD'),
    'SET_VALUE': Symbol('SET_VALUE')
};

export const setField = (field) => ({type: actionList.SET_FIELD, field});
export const setValue = (value) => ({type: actionList.SET_VALUE, value});
