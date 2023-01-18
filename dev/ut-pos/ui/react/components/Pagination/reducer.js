import { actionTypes } from './actions';
import { FETCH } from '../../pages/Terminal/actionTypes';
import { fromJS } from 'immutable';

const defaultState = {
    pagination: {
        pageSize: 25,
        pageNumber: 1,
        recordsTotal: 0
    },
    changeId: 0
};

export const posTerminalGridPagination = (state = fromJS(defaultState), action) => {
    switch (action.type) {
        case actionTypes.updatePagination:
            return state
                .update('changeId', (v) => (v + 1))
                .mergeIn(['pagination'], action.params);
        case FETCH:
            if (action.methodRequestState === 'requested' && !action.params.posId) {
                action.params = {
                    ...action.params,
                    ...{
                        pageSize: state.getIn(['pagination', 'pageSize']),
                        pageNumber: state.getIn(['pagination', 'pageNumber'])
                    }
                };
            } else if (action.methodRequestState === 'finished' && !action.params.posId && action.result) {
                let pagination = action.result.pagination[0];
                if (pagination) {
                    return state
                        .setIn(['pagination', 'pageSize'], pagination.pageSize)
                        .setIn(['pagination', 'pageNumber'], pagination.pageNumber)
                        .setIn(['pagination', 'recordsTotal'], pagination.recordsTotal);
                }
                return state;
            }
    }

    return state;
};
