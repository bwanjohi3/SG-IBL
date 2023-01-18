import immutable from 'immutable';
import * as actionTypes from './actions';

const defaultCardsBatchesFilter = immutable.fromJS({
    changeId: 0
});

export function cardBatchesFilterClear(state = defaultCardsBatchesFilter, action) {
    switch (action.type) {
        case actionTypes.CLEAR_FILTERS:
            return state;
    }

    return state;
}
