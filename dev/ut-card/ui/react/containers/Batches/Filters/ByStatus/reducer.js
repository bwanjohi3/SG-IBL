import {Map, List} from 'immutable';
import {actionList} from './actions';
import {actionTypes as clearFilterActions} from '../Clear/actions';
const defaultState = Map({changeId: 0, data: List([])});

export const batchesFilterByStatus = (state = defaultState, action) => {
    switch (action.type) {
        case actionList.SET:
            if (action.value === '__placeholder__') {
                return state
                    .delete('value')
                    .update('changeId', (v) => (v + 1));
            } else {
                return state
                    .set('value', action.value)
                    .update('changeId', (v) => (v + 1));
            }
        case clearFilterActions.CLEAR_FILTERS:
            return state
                .update('changeId', (v) => (v + 1))
                .delete('value');
    }
    return state;
};
