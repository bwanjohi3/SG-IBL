import { actionsList } from './actions';
import immutable from 'immutable';

const defaultSelectionState = {
    businessUnitId: undefined,
    changeId: 0,
    breadcrumbs: []
};
const defaultStateImmutableSelection = immutable.fromJS(defaultSelectionState);

export const cardManagementFilterByBusinessUnitSelection = (state = defaultStateImmutableSelection, action) => {
    switch (action.type) {
        case actionsList.SET_PARENT_BUSINESS_UNIT:
            return state
                .update('changeId', (v) => (v + 1))
                .set('businessUnitId', action.businessUnitId)
                .set('breadcrumbs', immutable.fromJS(action.breadcrumbs));
    }

    return state;
};
