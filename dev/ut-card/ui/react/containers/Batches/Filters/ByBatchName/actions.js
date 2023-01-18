export const actionList = {
    'SET': Symbol('SET')
};

export const set = (value) => ({type: actionList.SET, value});
