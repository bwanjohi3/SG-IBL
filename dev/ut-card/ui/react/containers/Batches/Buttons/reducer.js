import { actionsList } from './actions';
import immutable from 'immutable';

const defaultState = {
    currentActionId: -1
};

const defaultStateImmutable = immutable.fromJS(defaultState);

export function batchesActionButtons(state = defaultStateImmutable, action) {
    switch (action.type) {
        case actionsList.SET_CURRENT_ACTION:
            if (action.params) {
                return state
                        .set('currentActionId', action.params.actionId);
            }
            break;
    }
    return state;
}
