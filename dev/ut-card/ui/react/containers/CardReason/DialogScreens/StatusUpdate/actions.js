import { parseRequestParams } from './helpers';

export const actionList = {
    TOGGLE: Symbol('TOGGLE'),
    UPDATE: Symbol('UPDATE')
};

export function toggle() {
    return {
        type: actionList.TOGGLE
    };
}

export function update(params) {
    return {
        type: actionList.UPDATE,
        method: 'card.reason.statusUpdate',
        params: {reason: parseRequestParams(params)}
    };
};
