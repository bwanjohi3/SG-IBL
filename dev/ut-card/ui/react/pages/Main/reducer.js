import {fromJS} from 'immutable';
import {actionList} from './actions';

const defaultStateUtCardStatusAction = fromJS({
    'state-application': [],
    'filter-application': [],
    'state-batch': [],
    'embossedTypeIdNamed': undefined,
    'embossedTypeIdNoNamed': undefined,
    'ownershipIdOwn': [],
    'ownershipIdExternal': [],
    'embossedTypes': []
});

const statusFilter = (list) => {
    let statuses = list.map((item) => {
        return {
            key: item.statusId,
            name: item.statusName,
            label: item.statusLabel
        };
    });

    return statuses;
};

const getActions = (list) => {
    return list.reduce((prev, cur) => {
        if (!~prev.actionIds.indexOf(cur.actionId)) {
            prev.actionIds.push(cur.actionId);
            prev.finalList.push({id: cur.actionId, label: cur.actionLabel, name: cur.actionName, description: cur.actionDescription, for: cur.embossedTypeId, confirmationRequired: cur.flagToConfirm, reasonRequired: cur.hasReasons});
        }
        return prev;
    }, {actionIds: [], finalList: []}).finalList || [];
};

const getReasons = (list) => {
    return list.map((reason) => {
        return {
            key: reason.get('reasonId'),
            name: reason.get('name'),
            actionLabel: reason.get('actionLabel')
        };
    });
};

const getActionsByLabel = (actionsList) => {
    let actionsByLabel = actionsList.reduce((prev, cur) => {
        prev[cur.label] = cur;
        return prev;
    }, {});
    return actionsByLabel;
};

export const utCardStatusAction = (state = defaultStateUtCardStatusAction, action) => {
    if (action.type === actionList.FETCH) {
        if (action.methodRequestState === 'finished' && action.result) {
            var result = fromJS(action.result);
            return state
                .set('methodRequestState', action.methodRequestState)
                .set('state-application', result.get('Application'))
                .set('state-batch', result.get('Batch'))
                .set('state-card', result.get('Card'))
                .set('state-cardInUse', result.get('CardInUse'))
                .set('actions-card', getActions(action.result.Card))
                .set('actions-cardInUse', getActions(action.result.CardInUse))
                .set('actions-application', getActions(action.result.Application))
                .set('actions-batch', getActions(action.result.Batch))
                .set('actions-application-by-label', getActionsByLabel(getActions(action.result.Application)))
                .set('actions-cardInUse-by-label', getActionsByLabel(getActions(action.result.CardInUse)))
                .set('reasons-application', getReasons(result.get('ApplicationReason')))
                .set('reasons-batch', getReasons(result.get('BatchReason')))
                .set('reasons-card', getReasons(result.get('CardReason')))
                .set('reasons-cardInUse', getReasons(result.get('CardInUseReason')));
        } else if (action.methodRequestState === '') {
            return state
                .set('methodRequestState', action.methodRequestState);
        }
    } else if (action.type === actionList.FETCH_STATUSES) {
        if (action.methodRequestState === 'finished' && action.result) {
            return state
                .set('filter-card', statusFilter(action.result.Card))
                .set('filter-cardInUse', statusFilter(action.result.CardInUse))
                .set('filter-application', statusFilter(action.result.Application))
                .set('filter-batch', statusFilter(action.result.Batch));
        }
    } else if (action.type === actionList.FETCH_EMBOSSED_TYPES) {
        if (action.methodRequestState === 'finished' && action.result) {
            let embossedTypesMap = action.result.embossedType.reduce((prev, cur) => {
                prev.embossedTypes.push({
                    key: cur.embossedTypeId,
                    name: cur.embossedTypeName,
                    label: cur.itemCode
                });
                if (cur.itemCode === 'noNamed') {
                    prev.embossedTypeIdNoNamed = cur.embossedTypeId;
                } else if (cur.itemCode === 'named') {
                    prev.embossedTypeIdNamed = cur.embossedTypeId;
                }
                return prev;
            }, {embossedTypeIdNamed: undefined, embossedTypeIdNoNamed: undefined, embossedTypes: []});
            return state
                .set('embossedTypeIdNamed', embossedTypesMap.embossedTypeIdNamed)
                .set('embossedTypeIdNoNamed', embossedTypesMap.embossedTypeIdNoNamed)
                .set('embossedTypes', fromJS(embossedTypesMap.embossedTypes));
        }
    } else if (action.type === actionList.FETCH_OWNERSHIP_TYPES) {
        if (action.methodRequestState === 'finished' && action.result) {
            let ownTypeId = action.result.ownershipType.filter(type => type.itemCode.startsWith('own')).map(x => Number(x.ownershipTypeId));
            let externalTypeId = action.result.ownershipType.filter(type => type.itemCode.startsWith('external')).map(x => Number(x.ownershipTypeId));
            return state
                .set('ownershipIdOwn', fromJS(ownTypeId))
                .set('ownershipIdExternal', fromJS(externalTypeId));
        }
    }

    return state;
};
