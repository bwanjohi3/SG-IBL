import { actionsList } from './actions';
import {actionList as clearFilterActions} from '../Clear/actions';
import immutable from 'immutable';

const defaultState = {
    businessUnitId: null,
    changeId: 0,
    breadcrumbs: []
};
const defaultStateImmutable = immutable.fromJS(defaultState);

export const cardTypeBusinessUnitFilter = (state = defaultStateImmutable, action) => {
    switch (action.type) {
        case actionsList.SET_PARENT_BUSINESS_UNIT:
            return state
                .update('changeId', (v) => (v + 1))
                .set('businessUnitId', action.businessUnitId)
                .set('breadcrumbs', immutable.fromJS(action.breadcrumbs));
        case clearFilterActions.CLEAR_FILTERS:
            return state
                .set('businessUnitId', null)
                .set('breadcrumbs', immutable.fromJS([]));
    }

    return state;
};
