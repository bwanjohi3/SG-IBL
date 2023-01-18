import { actionsList } from './actions';
import {Map} from 'immutable';

const defaultState = Map({
    opened: false,
    action: {
        label: '',
        name: ''
    },
    changeId: 0
});

export function batchStatusUpdatePopup(state = defaultState, action) {
    switch (action.type) {
        case actionsList.TOGGLE_BATCH_STATUSUPDATE_PROMPT:
            // TODO: check for actionId in action.params !!!
            return state
                    .update('opened', (v) => (!v))
                    .set('action', action.params);
        case actionsList.STATUSUPDATE_BATCH:
            if (action.result && action.methodRequestState === 'finished') {
                return state
                        .update('opened', (v) => (false))
                        .update('changeId', (v) => (v + 1));
            } else {
                return state
                        .update('opened', (v) => (false));
            }
    }
    return state;
}
