import {Map} from 'immutable';
import * as actionTypes from './actionTypes.js';
const defaultState = Map({
    opened: false,
    changeId: 0,
    batchActionName: '',
    action: {
        label: '',
        name: ''
    },
    reasonId: 0,
    comment: ''
});

export const rejectDetails = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.TOGGLE_REJECT_BATCH_POPUP:
            return state
                    .update('opened', (v) => (!v))
                    .set('action', action.params)
                    .set('batchActionName', action.batchActionLabel);
        case actionTypes.REJECT_BATCH:
            if (action.result && action.methodRequestState === 'finished') {
                return state
                        .set('opened', defaultState.get('opened'))
                        .update('changeId', (v) => (v + 1))
                        .set('batchActionName', defaultState.get('batchActionName'))
                        .set('reasonId', defaultState.get('reasonId'))
                        .set('comment', defaultState.get('comment'));
            };
            break;
        case actionTypes.UPDATE:
            return state
                     .set(action.params.key, action.params.value);
    }
    return state;
};
