export const actionList = {
    ORDER: Symbol('ORDER_CARDS')
};

export const order = (field, state) => ({type: actionList.ORDER, params: {field, state}});
