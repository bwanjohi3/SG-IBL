import { actionsList } from './actions';
import immutable from 'immutable';

const defaultState = {
    businessUnitId: null,
    changeId: 0,
    breadcrumbs: []
};
const defaultStateImmutable = immutable.fromJS(defaultState);

export const cardProductManagementFilterByBusinessUnitSelection = (state = defaultStateImmutable, action) => {
    switch (action.type) {
        case actionsList.SET_PARENT_BUSINESS_UNIT:
            return state
                .update('changeId', (v) => (v + 1))
                .set('businessUnitId', action.businessUnitId)
                .set('breadcrumbs', immutable.fromJS(action.breadcrumbs));
    }

    return state;
};
