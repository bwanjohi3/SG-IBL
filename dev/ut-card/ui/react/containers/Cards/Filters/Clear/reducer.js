import immutable from 'immutable';
import { actionList } from './actions';

const defaultCardsApplicationsFilter = immutable.fromJS({
    changeId: 0
});

export function cardManagementFilterClear(state = defaultCardsApplicationsFilter, action) {
    switch (action.type) {
        case actionList.CLEAR_FILTERS:
            return state.set('changeId', state.get('changeId') + 1);
    }

    return state;
}
