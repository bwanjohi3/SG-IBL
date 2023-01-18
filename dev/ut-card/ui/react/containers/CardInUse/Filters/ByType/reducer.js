import {Map, List} from 'immutable';
import {actionList} from './actions';
import {CLEAR_FILTERS} from '../Clear/actionTypes';
import {parseFetchedTypes} from './helpers';
const defaultState = Map({changeId: 0, data: List([]), value: undefined});

export const cardInUseFilterByType = (state = defaultState, action) => {
    if (action.type === actionList.SET) {
        return state
            .set('value', action.value)
            .update('changeId', (v) => (v + 1));
    } else if (action.type === actionList.FETCH && action.result && action.methodRequestState === 'finished') {
        return state
            .set('data', List(parseFetchedTypes(action.result.cardType)));
    } else if (action.type === CLEAR_FILTERS) {
        return state
            .set('value', defaultState.get('value'));
    }
    return state;
};
