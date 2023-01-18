import * as actionTypes from './actionTypes';
import immutable from 'immutable';

const defaultState = {
    open: false,
    action: {}
};

const defaultStateImmutable = immutable.fromJS(defaultState);

export function cardApplicationConfirmActionPopup(state = defaultStateImmutable, action) {
    switch (action.type) {
        case actionTypes.OPEN_ACTION_CONFIRM_PROMPT:
            return state
                .set('open', true)
                .set('action', immutable.fromJS(action.params));
        case actionTypes.CLOSE_ACTION_CONFIRM_PROMPT:
            return defaultStateImmutable;
    }
    return state;
}
export default {cardApplicationConfirmActionPopup};
