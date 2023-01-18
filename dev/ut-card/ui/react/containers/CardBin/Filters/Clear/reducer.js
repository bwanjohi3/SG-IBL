import immutable from 'immutable';
import * as actionTypes from './actionTypes';

const defaultCardBinsFilter = immutable.fromJS({
    changeId: 0
});

export function cardBinsFilterClear(state = defaultCardBinsFilter, action) {
    switch (action.type) {
        case actionTypes.CLEAR_FILTERS:
            return state.set('changeId', state.get('changeId') + 1);
    }

    return state;
}
