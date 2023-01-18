import immutable from 'immutable';

export function parseBusinessUnits(units) {
    let parsed = units.map((unit) => ({
        key: unit.actorId,
        name: unit.organizationName
    }));

    return immutable.fromJS(parsed);
};

export function parseRequestParams(cards, targetBranchId) {
    return cards.map((card) => {
        return {
            cardId: card.get('cardId') | 0,
            statusId: card.get('statusId') | 0,
            targetBranchId: targetBranchId
        };
    }).toJS();
};
