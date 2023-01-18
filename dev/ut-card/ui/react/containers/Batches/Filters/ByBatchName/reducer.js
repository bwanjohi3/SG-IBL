import {Map} from 'immutable';
import {actionList} from './actions';
import {actionTypes as clearFilterActions} from '../Clear/actions';
const defaultState = Map({changeId: 0, value: undefined});

export const batchesFilterByBatchName = (state = defaultState, action) => {
    switch (action.type) {
        case actionList.SET:
            return state
                .set('value', action.value === '' ? undefined : action.value)
                .update('changeId', (v) => (v + 1));
        case clearFilterActions.CLEAR_FILTERS:
            return state
                .update('changeId', (v) => (v + 1))
                .set('value', defaultState.get('value'));
    }
    return state;
};
