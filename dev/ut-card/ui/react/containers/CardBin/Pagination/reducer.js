import immutable from 'immutable';
import * as actionTypes from './actionTypes';
import {FETCH_BINS} from './../Grid/actionTypes';
import {CLEAR_FILTERS} from './../Filters/Clear/actionTypes';

const defaultCardsBinPagination = immutable.fromJS({
    pagination: {
        pageSize: 25,
        pageNumber: 1,
        recordsTotal: 0
    },
    changeId: 0
});

export function cardBinsPagination(state = defaultCardsBinPagination, action) {
    switch (action.type) {
        case actionTypes.UPDATE_PAGINATION:
            return state
                .set('changeId', state.get('changeId') + 1)
                .mergeIn(['pagination'], action.params);
        case FETCH_BINS:
            if (action.result) {
                return state.set('pagination', immutable.fromJS(action.result.pagination[0]) || defaultCardsBinPagination.get('pagination'));
            }
            break;
        case CLEAR_FILTERS:
            let oldPageSize = state.getIn(['pagination', 'pageSize']);
            let newPagination = defaultCardsBinPagination.get('pagination').set('pageSize', oldPageSize);
            return state.set('pagination', newPagination);
    }

    return state;
}
