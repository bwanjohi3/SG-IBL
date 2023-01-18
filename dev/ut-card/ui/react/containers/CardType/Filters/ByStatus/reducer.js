import {Map} from 'immutable';
import * as actionTypes from './actionTypes';
import {actionList as clearFilterActions} from '../Clear/actions';

const defaultState = Map({
    isActive: '__placeholder__',
    changeId: 0
});

export const cardTypeStatusFilter = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.CHANGE_STATUS_FILTER:
            return state
                .set('isActive', action.params)
                .update('changeId', (v) => ++v);
        case clearFilterActions.CLEAR_FILTERS:
            return state.set('isActive', '__placeholder__');
    }
    return state;
};
