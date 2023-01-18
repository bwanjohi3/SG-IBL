export const actionList = {
    'TOGGLE': Symbol('TOGGLE_CARD_PRODUCT_TOOLBOX'),
    'SHOW_FILTERS': Symbol('SHOW_FILTERS_CARD_PRODUCT_TOOLBOX'),
    'SHOW_BUTTONS': Symbol('SHOW_BUTTONS_CARD_PRODUCT_TOOLBOX'),
    'TOGGLE_STATUS': Symbol('TOGGLE_STATUS_CARD_PRODUCT_TOOLBOX')
};

export const toggle = () => ({type: actionList.TOGGLE});
export const show = (what) => ({type: what === 'button' ? actionList.SHOW_BUTTONS : actionList.SHOW_FILTERS});
