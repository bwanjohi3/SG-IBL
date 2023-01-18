import immutable from 'immutable';
import * as actionTypes from './actionTypes';

const defaultCardsApplicationsFilter = immutable.fromJS({
    changeId: 0
});

export function cardApplicationsFilterClear(state = defaultCardsApplicationsFilter, action) {
    switch (action.type) {
        case actionTypes.CLEAR_FILTERS:
            return state.set('changeId', state.get('changeId') + 1);
    }

    return state;
}
