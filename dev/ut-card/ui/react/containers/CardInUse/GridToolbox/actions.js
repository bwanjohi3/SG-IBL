export const actionList = {
    'TOGGLE': Symbol('TOGGLE'),
    'SHOW_FILTERS': Symbol('SHOW_FILTERS'),
    'SHOW_BUTTONS': Symbol('SHOW_BUTTONS')
};

export const toggle = () => ({type: actionList.TOGGLE});
export const show = (what) => ({type: what === 'button' ? actionList.SHOW_BUTTONS : actionList.SHOW_FILTERS});
