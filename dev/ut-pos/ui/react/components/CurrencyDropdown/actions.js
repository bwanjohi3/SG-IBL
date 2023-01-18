export const actionList = {
    FETCH: Symbol('FETCH')
};

export const fetch = () => {
    return {
        type: actionList.FETCH,
        method: 'core.currency.fetch',
        params: {isEnabled: 1}
    };
};
