import { parseFilters } from './helpers';

export const actionList = {
    'FETCH': Symbol('FETCH'),
    'CHECK': Symbol('CHECK'),
    'CHECK_ALL': Symbol('CHECK_ALL'),
    'CLEAR_AND_CHECK': Symbol('CLEAR_AND_CHECK'),
    'SELECT': Symbol('SELECT'),
    'CLEAR_SELECTED': Symbol('CLEAR_SELECTED'),
    'TOGGLE_COLUMN': Symbol('TOGGLE_COLUMN'),
    'SET_VISIBLE_COLUMNS': Symbol('SET_VISIBLE_COLUMNS')
};

export function fetchReasons(params) {
    return {
        type: actionList.FETCH,
        methodRequestState: 'finished',
        method: 'card.reason.fetch',
        params: parseFilters(params)
    };
};
export function check(checked, reason) {
    return {
        type: actionList.CHECK,
        reason: reason,
        checked: checked
    };
};
export function checkAll(checked, reasons) {
    return {
        type: actionList.CHECK_ALL,
        reasons: reasons,
        checked: checked
    };
}
export function clearAndCheck(reason) {
    return {
        type: actionList.CLEAR_AND_CHECK,
        reason: reason
    };
};
export function select(reason) {
    return {
        type: actionList.SELECT,
        reason: reason
    };
};
export function clearSelected() {
    return {
        type: actionList.CLEAR_SELECTED
    };
};
export function toggleColumn(field) {
    return {
        type: actionList.TOGGLE_COLUMN,
        field
    };
};
export function setVisibleColumns() {
    return {
        type: actionList.SET_VISIBLE_COLUMNS
    };
};
