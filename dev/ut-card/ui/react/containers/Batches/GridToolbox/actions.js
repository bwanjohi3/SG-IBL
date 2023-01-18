export const actionList = {
    'TOGGLE': Symbol('TOGGLE'),
    'SET': Symbol('SET')
};

export const toggle = () => ({type: actionList.TOGGLE});
export const set = (filtersOpened) => ({type: actionList.SET, filtersOpened: filtersOpened});
