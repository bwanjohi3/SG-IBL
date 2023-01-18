import {fromJS} from 'immutable';
import * as actionTypes from './actionTypes';
import {parseBusinessUnits} from './helpers';
import {methodRequestState} from 'ut-front-react/constants';

const defaultStateImmutable = fromJS({
    units: []
});

export function cardManagementFiltersWrapper(state = defaultStateImmutable, action) {
    switch (action.type) {
        case actionTypes.FETCH_UNITS:
            if (action.result && action.methodRequestState === methodRequestState.FINISHED) {
                return state
                    .set('units', parseBusinessUnits(action.result.allBranches));
            }
            return state;
    }
    return state;
};
