export const actionList = {
    SET_CONFIG: Symbol('SET_CONFIG')
};

export const setConfig = (config) => ({type: actionList.SET_CONFIG, config});
