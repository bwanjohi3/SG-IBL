import {fromJS} from 'immutable';
import {actionList as clearFilterActions} from '../Clear/actions';
import {actionList} from './actions';

const defaultState = {
    value: undefined,
    changeId: 0,
    data: []
};
const defaultStateImmutable = fromJS(defaultState);

export function cardReasonFilterByStatus(state = defaultStateImmutable, action) {
    switch (action.type) {
        case actionList.SET:
            return state
                .set('value', action.value)
                .update('changeId', (v) => (v + 1));
        case clearFilterActions.CLEAR_FILTERS:
            return state
                .set('value', defaultStateImmutable.get('value'));
    }
    return state;
};
