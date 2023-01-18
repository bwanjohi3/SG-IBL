import {Map} from 'immutable';
import * as actionTypes from './actionTypes';
import {actionTypes as clearFilterAction} from '../Clear/actions';

const defaultState = Map({
    changeId: 0,
    value: 0
});

export const batchesFilterByTargetUnit = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.UPDATE_TARGET_UNIT:
            let newValue = action.params > 0 ? action.params : defaultState.get('value');
            return state
                    .set('value', newValue)
                    .update('changeId', (v) => (v + 1));
        case clearFilterAction.CLEAR_FILTERS:
            return state
                    .update('changeId', (v) => (v + 1))
                    .set('value', defaultState.get('value'));
    }
    return state;
};
