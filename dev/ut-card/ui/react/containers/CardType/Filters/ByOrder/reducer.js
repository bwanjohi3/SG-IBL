import {Map} from 'immutable';
import * as actionTypes from './actionTypes';
import {actionList as clearFilterActions} from '../Clear/actions';

const defaultState = Map({
    orderBy: Map({
        column: '',
        direction: ''
    }),
    changeId: 0
});

export const cardTypeOrderFilter = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.CHANGE_ORDER_FILTER:
            return state
                .setIn(['orderBy', 'column'], action.params.column)
                .setIn(['orderBy', 'direction'], action.params.direction)
                .update('changeId', (v) => ++v);
        case clearFilterActions.CLEAR_FILTERS:
            return state
                .set('column', '')
                .set('direction', '');
    }
    return state;
};
