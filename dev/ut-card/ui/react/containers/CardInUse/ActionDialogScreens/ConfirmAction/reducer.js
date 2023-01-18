import { actionsList } from './actions';
import immutable from 'immutable';

const FINISHED = 'finished';
const REQUESTED = 'requested';

const defaultState = {
    open: false,
    changeId: 0
};

const defaultStateImmutable = immutable.fromJS(defaultState);

export function cardInUseConfirmActionPopup(state = defaultStateImmutable, action) {
    switch (action.type) {
        case actionsList.TOGGLE_ACTION_CONFIRM_PROMPT:
            let currentState = state.get('open');
            return state.set('open', !currentState);
        case actionsList.CONFIRM_ACTION:
            if (action.methodRequestState === REQUESTED) {
                return state
                        .set('open', defaultStateImmutable.get('open'));
            } else if (action.result && action.methodRequestState === FINISHED) {
                return state
                        .update('changeId', (v) => (v + 1));
            }
            break;
    }
    return state;
}
export default {cardInUseConfirmActionPopup};
