import { actionsList } from './actions';
import { parseBusinessUnits } from './helpers';
import immutable from 'immutable';

const FINISHED = 'finished';
const REQUESTED = 'requested';

const defaultState = {
    open: false,
    businessUnits: [],
    businessUnitId: -1,
    changeId: 0
};

const defaultStateImmutable = immutable.fromJS(defaultState);

export function cardRelocationPopup(state = defaultStateImmutable, action) {
    switch (action.type) {
        case actionsList.TOGGLE_CARD_RELOCATION:
            let currentState = state.get('open');
            return state.set('open', !currentState);
        case actionsList.SET:
            if (action.params) {
                let selectedId = action.params.businessUnitId | 0;
                return state
                        .set('businessUnitId', selectedId);
            }
            break;
        case actionsList.RELOCATE:
            if (action.methodRequestState === REQUESTED) {
                return state
                    .set('open', defaultStateImmutable.get('open'));
            } else if (action.result && action.methodRequestState === FINISHED) {
                return state
                    .set('businessUnitId', defaultStateImmutable.get('businessUnitId'))
                    .update('changeId', (v) => (v + 1));
            }
            break;
        case actionsList.CLEAR:
            return state
                    .set('open', defaultStateImmutable.get('open'))
                    .set('businessUnitId', defaultStateImmutable.get('businessUnitId'));
        case actionsList.FETCH:
            if (action.result && action.methodRequestState === FINISHED) {
                return state
                        .set('businessUnits', parseBusinessUnits(action.result.allBranches));
            }
            break;
    }
    return state;
}
export default {cardRelocationPopup};
