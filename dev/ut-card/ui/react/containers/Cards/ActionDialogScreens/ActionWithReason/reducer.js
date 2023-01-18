import { actionsList } from './actions';
import immutable from 'immutable';

const FINISHED = 'finished';
const REQUESTED = 'requested';

const defaultState = {
    open: false,
    reason: {
        reasonId: -1,
        comment: ''
    },
    changeId: 0
};

const defaultStateImmutable = immutable.fromJS(defaultState);

export function cardActionWithReason(state = defaultStateImmutable, action) {
    switch (action.type) {
        case actionsList.TOGGLE_ACTION_WITH_REASON:
            let currentState = state.get('open');
            return state.set('open', !currentState);
        case actionsList.CHANGE_INPUT:
            if (action.params) {
                return state.setIn(['reason', action.params.key], action.params.value);
            }
            break;
        case actionsList.CONFIRM_ACTION:
            if (action.methodRequestState === REQUESTED) {
                return state
                        .set('open', defaultStateImmutable.get('open'));
            } else if (action.result && action.methodRequestState === FINISHED) {
                return state
                        .set('reason', defaultStateImmutable.get('reason'))
                        .update('changeId', (v) => (v + 1));
            }
            break;
        case actionsList.CLEAR:
            return state
                    .set('open', defaultStateImmutable.get('open'))
                    .set('reason', defaultStateImmutable.get('reason'));
    }
    return state;
}
export default {cardActionWithReason};
