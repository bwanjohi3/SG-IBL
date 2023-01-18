import {Map} from 'immutable';
import * as actionTypes from './actionTypes';
import {actionList as clearFilterActions} from '../Clear/actions';

const defaultState = Map({
    productName: null,
    changeId: 0
});

export const cardProductNameFilter = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.CHANGE_NAME_FILTER:
            return state
                .set('productName', action.params)
                .update('changeId', (v) => ++v);
        case clearFilterActions.CLEAR_FILTERS:
            return state.set('productName', null);
    }
    return state;
};
