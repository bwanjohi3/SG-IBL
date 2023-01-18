import immutable from 'immutable';
import * as actionTypes from './actionTypes';
import {FETCH_APPLICATIONS} from './../Grid/actionTypes';
import {CLEAR_FILTERS} from './../Filters/Clear/actionTypes';

const defaultCardsApplicationsPagination = immutable.fromJS({
    pagination: {
        pageSize: 25,
        pageNumber: 1,
        recordsTotal: 0
    },
    changeId: 0
});

export function cardApplicationsPagination(state = defaultCardsApplicationsPagination, action) {
    switch (action.type) {
        case actionTypes.UPDATE_PAGINATION:
            return state
                .set('changeId', state.get('changeId') + 1)
                .mergeIn(['pagination'], action.params);
        case FETCH_APPLICATIONS:
            if (action.result) {
                return state.set('pagination', immutable.fromJS(action.result.pagination[0]) || defaultCardsApplicationsPagination.get('pagination'));
            }
            break;
        case CLEAR_FILTERS:
            let oldPageSize = state.getIn(['pagination', 'pageSize']);
            let newPagination = defaultCardsApplicationsPagination.get('pagination').set('pageSize', oldPageSize);
            return state.set('pagination', newPagination);
    }

    return state;
}
