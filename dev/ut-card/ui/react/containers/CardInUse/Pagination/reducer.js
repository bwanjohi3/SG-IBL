import {fromJS} from 'immutable';
import * as actionTypes from './actionTypes';
import {CLEAR_FILTERS} from '../Filters/Clear/actionTypes';
import {actionList as gridActionList} from '../Grid/actions';

const defaultcardInUsePagination = fromJS({
    pagination: {
        pageSize: 25,
        pageNumber: 1,
        recordsTotal: 0
    },
    changeId: 0
});

export function cardInUsePagination(state = defaultcardInUsePagination, action) {
    switch (action.type) {
        case actionTypes.UPDATE:
            return state
                .update('changeId', (v) => (v + 1))
                .mergeIn(['pagination'], action.params);
        case CLEAR_FILTERS:
            return defaultcardInUsePagination;
        case gridActionList.FETCH:
            if (action.methodRequestState === 'finished' && action.result) {
                let res = fromJS(action.result);
                if (res.getIn(['pagination', 0])) {
                    return state
                        .set('pagination', res.getIn(['pagination', 0]));
                }
                return state
                        .set('pagination', defaultcardInUsePagination.get('pagination'));
            }
    }

    return state;
}
