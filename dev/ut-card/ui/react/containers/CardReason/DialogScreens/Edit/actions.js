import { parseRequestParams } from './helpers';

export const actionList = {
    TOGGLE: Symbol('TOGGLE'),
    GET: Symbol('GET'),
    EDIT: Symbol('EDIT'),
    SET: Symbol('SET'),
    FETCH_ACTIONS: Symbol('FETCH_ACTIONS')
};

export function toggle() {
    return {
        type: actionList.TOGGLE
    };
}

export function getReason(reasonId) {
    return {
        type: actionList.GET,
        method: 'card.reason.get',
        params: {reasonId: reasonId}
    };
}

export function edit(params) {
    return {
        type: actionList.EDIT,
        method: 'card.reason.edit',
        params: parseRequestParams(params)
    };
};

export function set(params) {
    return {
        type: actionList.SET,
        params: params
    };
};
export function fetchActions() {
    return {
        type: actionList.FETCH_ACTIONS,
        params: {},
        method: 'card.moduleAction.list'
    };
};
