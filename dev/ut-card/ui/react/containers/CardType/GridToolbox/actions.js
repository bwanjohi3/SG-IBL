export const actionList = {
    'TOGGLE': Symbol('TOGGLE_CARD_TYPE_TOOLBOX'),
    'SHOW_FILTERS': Symbol('SHOW_FILTERS_CARD_TYPE_TOOLBOX'),
    'SHOW_BUTTONS': Symbol('SHOW_BUTTONS_CARD_TYPE_TOOLBOX'),
    'TOGGLE_STATUS': Symbol('TOGGLE_STATUS_CARD_TYPE_TOOLBOX')
};

export const toggle = () => ({type: actionList.TOGGLE});
export const show = (what) => ({type: what === 'button' ? actionList.SHOW_BUTTONS : actionList.SHOW_FILTERS});
