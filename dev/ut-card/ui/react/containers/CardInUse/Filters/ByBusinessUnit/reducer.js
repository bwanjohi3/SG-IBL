import * as actionTypes from './actionTypes';
import immutable from 'immutable';

const defaultState = {
    businessUnitId: undefined,
    changeId: 0,
    breadcrumbs: []
};
const defaultStateImmutableSelection = immutable.fromJS(defaultState);

export const cardInUseFilterByBUSelection = (state = defaultStateImmutableSelection, action) => {
    switch (action.type) {
        case actionTypes.SET_PARENT_BUSINESS_UNIT:
            return state
                .update('changeId', (v) => (v + 1))
                .set('businessUnitId', action.businessUnitId)
                .set('breadcrumbs', immutable.fromJS(action.breadcrumbs));
    }

    return state;
};
