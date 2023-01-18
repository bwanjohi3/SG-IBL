import { actionList } from './actions';
import immutable from 'immutable';

const FINISHED = 'finished'; // from methodRequestState
const REQUESTED = 'requested';

const defaultState = {
    open: false,
    changeId: 0
};

const defaultStateImmutable = immutable.fromJS(defaultState);

export function cardReasonStatusUpdateDialog(state = defaultStateImmutable, action) {
    switch (action.type) {
        case actionList.TOGGLE:
            if (state.get('open')) {
                state = state
                    .set('input', defaultStateImmutable.get('input'));
            }
            return state
                .set('open', !state.get('open'));
        case actionList.UPDATE:
            if (action.methodRequestState === REQUESTED) {
                return state
                    .set('open', !state.get('open'));
            } else if (action.methodRequestState === FINISHED) {
                return state
                    .update('changeId', (v) => (v + 1));
            }
            break;
    }
    return state;
};
