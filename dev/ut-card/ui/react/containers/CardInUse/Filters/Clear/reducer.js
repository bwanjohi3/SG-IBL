import immutable from 'immutable';
import * as actionTypes from './actionTypes';

const defaultCardInUseFilterClear = immutable.fromJS({
    changeId: 0
});

export function cardInUseFilterClear(state = defaultCardInUseFilterClear, action) {
    switch (action.type) {
        case actionTypes.CLEAR_FILTERS:
            return state.set('changeId', state.get('changeId') + 1);
    }

    return state;
}
