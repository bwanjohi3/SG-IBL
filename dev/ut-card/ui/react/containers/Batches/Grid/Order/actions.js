export const actionList = {
    ORDER: Symbol('ORDER')
};

export const order = (field, state) => ({type: actionList.ORDER, params: {field, state}});
