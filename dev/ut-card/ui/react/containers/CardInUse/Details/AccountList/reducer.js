import {Map, fromJS, List} from 'immutable';
import {actionList} from './actions';
import {actionList as detailsAccountList} from '../../Details/actions';

const cardInUseAccountDef = Map({
    id: 0,
    changeId: 0,
    linkedAs: List(),
    data: Map({
        unlinked: List(),
        linked: List()
    })
});

export const cardInUseAccount = (state = cardInUseAccountDef, action) => {
    switch (action.type) {
        case detailsAccountList.FETCH:
            if (action.methodRequestState === 'finished' && action.result) {
                let id = Date.now();
                let actionResultImmutable = fromJS(action.result);
                let accountLinks = actionResultImmutable.get('accountLink').map((account) => {
                    return Map({
                        key: account.get('accountLinkId'),
                        name: account.get('name')
                    });
                });
                return state
                    .set('linkedAs', accountLinks)
                    .set('data', actionResultImmutable.get('accounts')
                    .map((item) => (item.set('feId', ++id)))
                    .reduce((prev, cur) => {
                        if (!cur.get('isLinked')) { // unlinked
                            return prev.update('unlinked', (v) => {
                                return v.push(cur);
                            });
                        } else {
                            return prev.update('linked', (v) => {
                                return v.push(cur);
                            });
                        }
                    }, Map({linked: List(), unlinked: List()})));
            }
            return state;
        case actionList.ADD:
            return state.update('data', (data) => {
                let transferable = data.get('linked');
                return data
                    .update('unlinked', (list) => {
                        return list.filter((item, idx) => {
                            if (action.params.id === item.get('feId')) {
                                let transferableItem = item.set('cardId', action.params.cardId).set('isPrimary', 0).set('isLinked', 1);
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
            }).update('changeId', (v) => (v + 1));
        case actionList.DELETE:
            return state.update('data', (data) => {
                let transferable = data.get('unlinked');
                return data
                    .update('linked', (list) => {
                        return list.filter((item, idx) => {
                            if (action.params.id === item.get('feId')) {
                                transferable = transferable.push(item.set('cardId', undefined).set('isPrimary', 0).set('isLinked', 0));
                                return false;
                            }
                            return true;
                        });
                    })
                    .set('unlinked', transferable);
            }).update('changeId', (v) => (v + 1));
        case actionList.SET_DEFAULT:
            return state.updateIn(['data', 'linked'], (list) => {
                let noChanged = list.filter(i => action.params.currency !== i.get('currency'));
                let changed = list
                    .filter(i => action.params.currency === i.get('currency'))
                    .map((item) => {
                        return item.set('isPrimary', (action.params.id === item.get('feId')) ? 1 : 0);
                    });
                    return changed.concat(noChanged);
                    
            }).update('changeId', (v) => (v + 1));
        default:
            return state;
    }
};
