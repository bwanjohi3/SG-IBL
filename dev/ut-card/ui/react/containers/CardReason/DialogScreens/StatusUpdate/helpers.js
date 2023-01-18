export function parseRequestParams({reasons, isActive}) {
    return reasons.map((reason) => {
        return {
            reasonId: reason.get('reasonId'),
            isActive: isActive
        };
    }).toJS();
};
