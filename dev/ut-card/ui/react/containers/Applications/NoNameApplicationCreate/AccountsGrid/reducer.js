import immutable, {fromJS, Map, List} from 'immutable';
import * as actionTypes from './actionTypes';
import {SET_ERRORS, SEARCH_CUSTOMER_BY_NAME} from './../actionTypes';

const cardNoNameApplicationAccountsDefaultState = immutable.fromJS({
    id: 0,
    changeId: 0,
    fetched: false,
    data: {
        unlinked: [],
        linked: []
    },
    linkedAs: [],
    errors: {
        hasAccountsError: false,
        hasLinkedAccountsError: false,
        hasPrimaryAccountError: false
    }
});

export const cardNoNameApplicationAccounts = (state = cardNoNameApplicationAccountsDefaultState, action) => {
    switch (action.type) {
        case actionTypes.FETCH_ACCOUNTS:
            if (action.methodRequestState === 'finished' && action.result) {
                let id = Date.now();
                let actionResultImmutable = fromJS(action.result);
                let accountLinks = actionResultImmutable.get('accountLink').map((account) => {
                    return immutable.Map({
                        key: account.get('code'),
                        name: account.get('name')
                    });
                });
                return state
                    .set('fetched', true)
                    .set('errors', cardNoNameApplicationAccountsDefaultState.get('errors'))
                    .set('linkedAs', accountLinks)
                    .set('data', actionResultImmutable.get('account')
                    .map((item) => (item.set('feId', ++id)))
                    .reduce((prev, cur) => {
                        if (!cur.get('cardId')) { // unlinked
                            return prev.update('unlinked', (v) => {
                                return v.push(cur);
                            });
                        } else {
                            return prev.update('linked', (v) => {
                                return v.push(cur);
                            });
                        }
                    }, Map({linked: List(), unlinked: List()})));
            } else if (action.methodRequestState === 'finished' && action.error) {
                return state.set('fetched', true);
            }
            return state;
        case actionTypes.ADD:
            return state
                .setIn(['errors', 'hasLinkedAccountsError'], false)
                .update('data', (data) => {
                    let transferable = data.get('linked');
                    return data
                        .update('unlinked', (list) => {
                            return list.filter((item, idx) => {
                                if (action.params.id === item.get('feId')) {
                                    let transferableItem = item
                                        .set('cardId', action.params.cardId);
                                    if (action.params.record.accountLinkId) {
                                        transferableItem = transferableItem
                                            .set('accountLinkId', action.params.record.accountLinkId)
                                            .set('accountLinkText', action.params.record.accountLinkText);
                                    }
                                    transferable = transferable.push(transferableItem);
                                    return false;
                                }
                                return true;
                            });
                        })
                        .set('linked', transferable);
                });
        case actionTypes.DELETE:
            return state.update('data', (data) => {
                let transferable = data.get('unlinked');
                return data
                    .update('linked', (list) => {
                        return list.filter((item, idx) => {
                            if (action.params.id === item.get('feId')) {
                                transferable = transferable.push(item.set('cardId', undefined).set('isPrimary', 0));
                                return false;
                            }
                            return true;
                        });
                    })
                    .set('unlinked', transferable);
            });
        case actionTypes.SET_DEFAULT:
            return state.updateIn(['data', 'linked'], (list) => {
                let noChanged = list.filter(i => action.params.currency !== i.get('currency'));
                let changed = list
                    .filter(i => action.params.currency === i.get('currency'))
                    .map((item) => {
                        return item.set('isPrimary', (action.params.id === item.get('feId')) ? 1 : 0);
                    });
                    return changed.concat(noChanged);
            })
            .setIn(['errors', 'hasPrimaryAccountError'], false);
        case actionTypes.CLEAR:
            return cardNoNameApplicationAccountsDefaultState;
        case SET_ERRORS:
            return state.mergeDeepIn(['errors'], action.params.account);
        case SEARCH_CUSTOMER_BY_NAME:
            return cardNoNameApplicationAccountsDefaultState;
        default:
            return state;
    }
};
