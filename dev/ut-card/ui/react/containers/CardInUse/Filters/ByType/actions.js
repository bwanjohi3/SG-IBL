export const actionList = {
    'SET': Symbol('SET'),
    'FETCH': Symbol('FETCH')
};

export const set = (value) => ({type: actionList.SET, value});
export const fetch = () => ({type: actionList.FETCH, method: 'card.brand.fetch', params: {}});
