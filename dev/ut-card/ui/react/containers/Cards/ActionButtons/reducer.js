import {actionsList} from './actions';
import immutable from 'immutable';

const defaultState = {
    currentAction: {
        id: undefined,
        for: undefined,
        label: '',
        name: ''
    }
};

export const defaultStateImmutable = immutable.fromJS(defaultState);

export function cardManagementActionButtons(state = defaultStateImmutable, action) {
    switch (action.type) {
        case actionsList.SET_CURRENT_ACTION:
            if (action.params) {
                return state
                        .set('currentAction', immutable.fromJS(action.params.action));
            }
            break;
    }
    return state;
}
