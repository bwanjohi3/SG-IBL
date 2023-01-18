export const actionTypes = {
    updatePagination: Symbol('updatePagination')
};

export const updatePagination = (params) => ({type: actionTypes.updatePagination, params});
