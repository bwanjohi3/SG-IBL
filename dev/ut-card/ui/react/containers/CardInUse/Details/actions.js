export const actionList = {
    CLOSE: Symbol('CLOSE'),
    FETCH: Symbol('FETCH')
};

export const close = () => ({type: actionList.CLOSE});
export const fetch = (cardId) => ({type: actionList.FETCH, params: {cardId}, method: 'card.cardInUse.get'});
