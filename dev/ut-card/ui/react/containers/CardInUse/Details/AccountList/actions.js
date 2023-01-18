export const actionList = {
    SET_DEFAULT: Symbol('SET_DEFAULT'),
    ADD: Symbol('ADD'),
    DELETE: Symbol('DELETE')
};

export const link = (cardId, accountId, id, record) => ({type: actionList.ADD, params: {cardId, accountId, id, record}});
export const unLink = (cardId, accountId, id) => ({type: actionList.DELETE, params: {cardId, accountId, id}});
export const setDefault = (cardId, accountId, id, currency) => ({type: actionList.SET_DEFAULT, params: {cardId, accountId, id, currency}});
