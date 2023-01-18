import * as actionTypes from './actionTypes';
import immutable from 'immutable';

const defaultState = {
    open: false,
    action: {},
    reason: {
        reasonId: -1,
        comment: ''
    }
};

const defaultStateImmutable = immutable.fromJS(defaultState);

export function cardApplicationActionWithReason(state = defaultStateImmutable, action) {
    switch (action.type) {
        case actionTypes.OPEN_ACTION_WITH_REASON:
            return state
                .set('open', true)
                .set('action', immutable.fromJS(action.params));
        case actionTypes.CLOSE_ACTION_WITH_REASON:
            return state.set('open', false);
        case actionTypes.CHANGE_INPUT:
            if (action.params) {
                return state.setIn(['reason', action.params.key], action.params.value);
            }
            break;
        case actionTypes.CLEAR:
            return defaultStateImmutable;
    }
    return state;
}

export default {cardApplicationActionWithReason};
