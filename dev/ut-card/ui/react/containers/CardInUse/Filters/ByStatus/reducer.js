import {Map, List} from 'immutable';
import {actionList} from './actions';
import {CLEAR_FILTERS} from '../Clear/actionTypes';
const defaultState = Map({changeId: 0, data: List([]), value: undefined});

export const cardInUseFilterByStatus = (state = defaultState, action) => {
    if (action.type === actionList.SET) {
        return state
            .set('value', action.value)
            .update('changeId', (v) => (v + 1));
    } else if (action.type === CLEAR_FILTERS) {
        return state
            .set('value', defaultState.get('value'));
    }
    return state;
};
