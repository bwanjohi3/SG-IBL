import {fromJS} from 'immutable';
import * as actionTypes from './actionTypes';
import {FETCH} from '../Grid/actionTypes';

const defaultBatchesPagination = fromJS({
    pagination: {
        pageSize: 25,
        pageNumber: 1,
        recordsTotal: 0
    },
    changeId: 0
});

export function batchesPagination(state = defaultBatchesPagination, action) {
    switch (action.type) {
        case actionTypes.UPDATE:
            return state
                .update('changeId', (v) => (v + 1))
                .mergeIn(['pagination'], action.params);
        case FETCH:
            if (action.result) {
                return state.set('pagination', fromJS(action.result.pagination[0] || defaultBatchesPagination.get('pagination')));
            }
    }

    return state;
}
