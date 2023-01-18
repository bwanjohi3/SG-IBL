export const actionList = {
    'FETCH_CARD_PRODUCTS': Symbol('FETCH_CARD_PRODUCTS')
};

export const fetch = (ownershipTypeId) => {
    return {
        type: actionList.FETCH_CARD_PRODUCTS,
        method: 'card.product.list',
        params: {
            ownershipTypeId
        }
    };
};
