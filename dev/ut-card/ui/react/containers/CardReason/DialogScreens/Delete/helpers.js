export function parseRequestParams(reasons) {
    return reasons.map((reason) => {
        return reason.get('reasonId');
    }).toJS();
}
