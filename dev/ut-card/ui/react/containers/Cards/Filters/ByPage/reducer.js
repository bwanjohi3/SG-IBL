import {fromJS, Map} from 'immutable';
import {actionList as clearFilterActions} from '../Clear/actions';
import {actionsList} from './actions';
import {actionList as gridActions} from '../../Grid/actions';

const defaultState = Map({
    pagination: Map({
        pageSize: 25,
        pageNumber: 1,
        recordsTotal: 0,
        pagesTotal: 0
    }),
    changeId: 0
});

const FINISHED = 'finished';

export function cardManagementFilterByPage(state = defaultState, action) {
    switch (action.type) {
        case actionsList.UPDATE_PAGE:
            return state
            .set('changeId', state.get('changeId') + 1)
            .mergeIn(['pagination'], action.params);
        case gridActions.FETCH_CARDS:
            if (action.result && action.methodRequestState === FINISHED) {
                return state.set('pagination', fromJS(action.result.pagination[0]) || defaultState.get('pagination'));
            }
            break;
        case clearFilterActions.CLEAR_FILTERS:
            return state
                .set('pagination', defaultState.get('pagination'));
    }
    return state;
}
