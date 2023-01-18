import {fromJS} from 'immutable';
import {CLEAR_FILTERS} from '../Clear/actionTypes';
import {actionList} from './actions';

const defaultState = {
    value: undefined,
    units: [],
    changeId: 0
};
const defaultStateImmutable = fromJS(defaultState);

export function cardInUseFilterByIssuingBusinessUnit(state = defaultStateImmutable, action) {
    switch (action.type) {
        case actionList.SET:
            return state
                .set('value', action.value)
                .update('changeId', (v) => (v + 1));
        case CLEAR_FILTERS:
            return state
                .set('value', defaultStateImmutable.get('value'));
    }
    return state;
};
