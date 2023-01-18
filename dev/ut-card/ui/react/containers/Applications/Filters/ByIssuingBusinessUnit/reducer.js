import immutable from 'immutable';
import * as actionTypes from './actionTypes';
import {CLEAR_FILTERS} from './../Clear/actionTypes';
import {methodRequestState} from './../../../constants';

const defaultCardsApplicationsFilter = immutable.fromJS({
    data: [],
    value: '',
    changeId: 0
});

export function cardApplicationsFilterByIssuingBusinessUnit(state = defaultCardsApplicationsFilter, action) {
    switch (action.type) {
        case actionTypes.UPDATE_UNIT:
            let newValue = action.params > 0 ? action.params : defaultCardsApplicationsFilter.get('value');
            return state
                .set('value', newValue)
                .set('changeId', state.get('changeId') + 1);
        case actionTypes.FETCH_UNITS:
            if (action.result && action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let data = action.result.allBranches.map((branch) => ({
                    key: branch.actorId,
                    name: branch.organizationName
                }));
                return state
                    .set('data', immutable.fromJS(data));
            }
            break;
        case CLEAR_FILTERS:
            return state.set('value', defaultCardsApplicationsFilter.get('value'));
    }

    return state;
}
