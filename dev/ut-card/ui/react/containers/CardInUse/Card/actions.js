export const actionList = {
    RESET_PIN_RETRIES: Symbol('RESET_PIN_RETRIES')
};

export const resetPinRetries = (cardIds) => ({type: actionList.RESET_PIN_RETRIES, params: {}, method: 'card.brand.fetch'});
