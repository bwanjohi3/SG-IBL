export const actionsList = {
    'SET_CURRENT_ACTION': Symbol('SET_CURRENT_ACTION')
};

export function set(action) {
    return {
        type: actionsList.SET_CURRENT_ACTION,
        params: {action}
    };
};
