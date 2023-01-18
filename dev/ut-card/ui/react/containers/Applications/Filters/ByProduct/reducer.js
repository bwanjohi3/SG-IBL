import immutable from 'immutable';
import * as actionTypes from './actionTypes';
import {CLEAR_FILTERS} from './../Clear/actionTypes';

const defaultCardsApplicationsFilter = immutable.fromJS({
    value: '',
    changeId: 0
});

export function cardApplicationsFilterByProduct(state = defaultCardsApplicationsFilter, action) {
    switch (action.type) {
        case actionTypes.UPDATE_PRODUCT:
            let newValue = action.params > 0 ? action.params : defaultCardsApplicationsFilter.get('value');
            return state
                .set('value', newValue)
                .set('changeId', state.get('changeId') + 1);
        case CLEAR_FILTERS:
            return state.set('value', defaultCardsApplicationsFilter.get('value'));
    }

    return state;
}
