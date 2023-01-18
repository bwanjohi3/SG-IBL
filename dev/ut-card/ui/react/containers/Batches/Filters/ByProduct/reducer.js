import {Map} from 'immutable';
import * as actionTypes from './actionTypes';
import {actionTypes as clearFilterActions} from '../Clear/actions';

const defaultState = Map({changeId: 0, value: ''});

export const batchesFilterByProduct = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.UPDATE_PRODUCT:
            let newValue = action.params > 0 ? action.params : defaultState.get('value');
            return state
                .set('value', newValue)
                .update('changeId', (v) => (v + 1));
        case clearFilterActions.CLEAR_FILTERS:
            return state
                .update('changeId', (v) => (v + 1))
                .set('value', defaultState.get('value'));
    }
    return state;
};
