import {Map} from 'immutable';
import {actionList} from './actions';
import {CLEAR_FILTERS} from '../Clear/actionTypes';
const defaultState = Map({changeId: 0, field: '', value: ''});

export const cardInUseFilterByCustomSearch = (state = defaultState, action) => {
    if (action.type === actionList.SET_FIELD) {
        return state
            .set('field', action.field)
            .update('changeId', (v) => {
                if (state.get('value') !== '') {
                    return v + 1;
                }
                return v;
            });
    } else if (action.type === actionList.SET_VALUE) {
        return state
            .set('value', action.value)
            .update('changeId', (v) => {
                if (state.get('field') !== '') {
                    return v + 1;
                }
                return v;
            });
    } else if (action.type === CLEAR_FILTERS) {
        return state
            .set('field', defaultState.get('field'))
            .set('value', '');
    }
    return state;
};
