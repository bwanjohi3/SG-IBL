import { parseRequestParams } from './helpers';

export const actionList = {
    TOGGLE: Symbol('TOGGLE'),
    CREATE: Symbol('CREATE'),
    SET: Symbol('SET'),
    FETCH_ACTIONS: Symbol('FETCH_ACTIONS')
};

export function toggle() {
    return {
        type: actionList.TOGGLE
    };
}

export function create(params) {
    return {
        type: actionList.CREATE,
        method: 'card.reason.add',
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
