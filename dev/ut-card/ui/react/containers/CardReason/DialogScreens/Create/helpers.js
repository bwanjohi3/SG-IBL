export function parseRequestParams(params) {
    return {
        reason: {
            module: params.get('module'),
            name: params.get('reasonName').trim(),
            isActive: params.get('isActive')
        },
        action: params.get('actions').map((action) => (action.get('key'))).toJS()
    };
};
