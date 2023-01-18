export const actionList = {
    'SET': Symbol('SET'),
    'FETCH': Symbol('FETCH')
};

export const set = (value) => ({type: actionList.SET, value});
