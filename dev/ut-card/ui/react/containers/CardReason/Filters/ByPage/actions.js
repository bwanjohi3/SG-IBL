export const actionsList = {
    'UPDATE_PAGE': Symbol('UPDATE_PAGE')
};

export function update(params) {
    return {
        type: actionsList.UPDATE_PAGE,
        params: params
    };
}
