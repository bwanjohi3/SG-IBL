import { actionsList } from './actions';
import immutable, {fromJS} from 'immutable';

const FINISHED = 'finished';

const defaultState = {
    open: false,
    card: {
        data: {},
        accounts: [],
        attachments: []
    }
};

const defaultStateImmutable = immutable.fromJS(defaultState);

export function cardDetailsPopup(state = defaultStateImmutable, action) {
    switch (action.type) {
        case actionsList.TOGGLE_CARD_DETAILS:
            let currentState = state.get('open');
            if (currentState) {
                return defaultStateImmutable;
            }
            return state
                    .set('open', !currentState);
        case actionsList.FETCH_CARD:
            if (action.methodRequestState === FINISHED && action.result) {
                let linkedAccounts = action.result.accounts.filter((account) => {
                    return account.isLinked;
                });

                return state
                        .setIn(['card', 'data'], fromJS(action.result.card))
                        .setIn(['card', 'accounts'], fromJS(linkedAccounts))
                        .setIn(['card', 'attachments'], fromJS(action.result.documents));
            }
            break;
    }

    return state;
}

export default {cardDetailsPopup};
