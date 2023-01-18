import { parseRequestParams } from './helpers';

export const actionList = {
    TOGGLE: Symbol('TOGGLE'),
    DELETE: Symbol('DELETE')
};

export function toggle() {
    return {
        type: actionList.TOGGLE
    };
}

export function deleteReason(params) {
    return {
        type: actionList.DELETE,
        method: 'card.reason.delete',
        params: {reason: parseRequestParams(params)}
    };
};
