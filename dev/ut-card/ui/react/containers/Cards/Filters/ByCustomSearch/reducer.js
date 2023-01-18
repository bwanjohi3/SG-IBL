import {Map} from 'immutable';

import {actionList as clearFilterActions} from '../Clear/actions';
import {actionList} from './actions';
const defaultState = Map({changeId: 0, field: '', value: ''});

export const cardManagementFilterByCustomSearch = (state = defaultState, action) => {
    switch (action.type) {
        case actionList.SET_FIELD:
            return state
                .set('field', action.field)
                .update('changeId', (v) => {
                    if (state.get('value') !== '') {
                        return v + 1;
                    }
                    return v;
                });
        case actionList.SET_VALUE:
            return state
                .set('value', action.value)
                .update('changeId', (v) => {
                    if (state.get('field') !== '') {
                        return v + 1;
                    }
                    return v;
                });
        case clearFilterActions.CLEAR_FILTERS:
            return state
            .set('field', defaultState.get('field'))
            .set('value', defaultState.get('value'));
    }
    return state;
};
