import immutable from 'immutable';
import { actionList } from './actions';

const defaultCardTypeFilterClear = immutable.fromJS({
    changeId: 0
});

export function cardTypeFilterClear(state = defaultCardTypeFilterClear, action) {
    switch (action.type) {
        case actionList.CLEAR_FILTERS:
            return state.set('changeId', state.get('changeId') + 1);
    }

    return state;
}
