export const actionList = {
    'FETCH': Symbol('FETCH')
};

export const fetch = () => ({type: actionList.FETCH, params: {}, method: 'customer.organization.list'});
