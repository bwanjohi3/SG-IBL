import immutable from 'immutable';
import * as actionTypes from './actionTypes';
import {CLEAR_FILTERS} from './../Clear/actionTypes';

const defaultCardBinsFilter = immutable.fromJS({
    data: [{
        key: 1,
        name: 'Active'
    }, {
        key: 0,
        name: 'Inactive'
    }],
    value: '',
    changeId: 0
});

export function cardBinsFilterByStatus(state = defaultCardBinsFilter, action) {
    switch (action.type) {
        case actionTypes.UPDATE_STATUS:
            let newValue = action.params >= 0 ? action.params : defaultCardBinsFilter.get('value');
            return state
                .set('value', newValue)
                .set('changeId', state.get('changeId') + 1);
        case CLEAR_FILTERS:
            return state.set('value', defaultCardBinsFilter.get('value'));
    }

    return state;
}
