import { actionsList } from './actions';
import { actionList as updateActionsList } from '../../Details/AccountList/actions';
import { actionList as detailsActionsList } from '../../Details/actions';
import immutable from 'immutable';

const FINISHED = 'finished';
const REQUESTED = 'requested';

const defaultState = {
    open: false,
    changeId: 0,
    errors: {
        hasAccountsError: false,
        hasLinkedAccountsError: false,
        hasPrimaryAccountError: false
    },
    reason: {
        reasonId: -1,
        comment: ''
    }
};

const defaultStateImmutable = immutable.fromJS(defaultState);

export function cardInUseUpdatePopup(state = defaultStateImmutable, action) {
    switch (action.type) {
        case actionsList.TOGGLE_CARD_UPDATE:
            let currentState = state.get('open');
            return state
                .set('open', !currentState);
        case actionsList.ON_REASON_CHANGE:
            if (action.params) {
                return state
                    .setIn(['reason', action.params.key], action.params.value);
            }
            break;
        case actionsList.UPDATE:
            if (action.methodRequestState === REQUESTED) {
                return state
                        .set('open', defaultStateImmutable.get('open'));
            } else if (action.result && action.methodRequestState === FINISHED) {
                return state
                        .update('changeId', (v) => (v + 1));
            }
            break;
        case actionsList.SET_ACCOUNT_ERRORS:
            if (action.params) {
                return state
                    .set('open', defaultStateImmutable.get('open'))
                    .set('errors', action.params.errors);
            }
            break;
        case updateActionsList.ADD:
            if (action.params) {
                return state
                    .setIn(['errors', 'hasLinkedAccountsError'], defaultStateImmutable.getIn(['errors', 'hasLinkedAccountsError']));
            }
            break;
        case updateActionsList.SET_DEFAULT:
            if (action.params) {
                return state
                    .setIn(['errors', 'hasPrimaryAccountError'], defaultStateImmutable.getIn(['errors', 'hasPrimaryAccountError']));
            }
            break;
        case detailsActionsList.CLOSE:
            return state
                .set('errors', defaultStateImmutable.get('errors'));
    }
    return state;
}
export default {cardInUseUpdatePopup};
