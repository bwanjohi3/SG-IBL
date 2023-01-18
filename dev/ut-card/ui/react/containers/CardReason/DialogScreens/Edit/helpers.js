import immutable from 'immutable';

export function parseReason({cardReason, reasonAction}) {
    let reason = cardReason[0];
    let parsed = {
        id: reason.reasonId,
        module: reason.module,
        actions: reasonAction.map(action => ({
            key: action.actionId,
            name: action.actionName
        })),
        reasonName: reason.reasonName,
        isActive: reason.isActive ? 1 : 0
    };

    return immutable.fromJS(parsed);
};

export function parseRequestParams(params) {
    return {
        reason: {
            reasonId: params.get('id'),
            module: params.get('module'),
            name: params.get('reasonName').trim(),
            isActive: params.get('isActive')
        },
        action: params.get('actions').map((action) => (action.get('key'))).toJS()
    };
};
