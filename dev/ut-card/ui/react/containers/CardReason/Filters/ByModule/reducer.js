import {fromJS} from 'immutable';
import {actionList as clearFilterActions} from '../Clear/actions';
import {actionList} from './actions';

const defaultState = {
    value: undefined,
    changeId: 0,
    data: []
};
const defaultStateImmutable = fromJS(defaultState);

export function cardReasonFilterByModule(state = defaultStateImmutable, action) {
    switch (action.type) {
        case actionList.SET:
            let value = action.value !== '__placeholder__' ? action.value : undefined;
            return state
                .set('value', value)
                .update('changeId', (v) => (v + 1));
        case clearFilterActions.CLEAR_FILTERS:
            return state
                .set('value', defaultStateImmutable.get('value'));
    }
    return state;
};
