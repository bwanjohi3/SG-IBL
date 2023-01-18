export const actionList = {
    ORDER_CARDS: Symbol('ORDER_CARDS')
};

export const order = (field, state) => ({type: actionList.ORDER_CARDS, params: {field, state}});
