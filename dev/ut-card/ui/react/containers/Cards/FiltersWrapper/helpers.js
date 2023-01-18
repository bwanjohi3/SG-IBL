import immutable from 'immutable';

export function parseBusinessUnits(units) {
    let parsed = units.map((unit) => ({
        key: unit.actorId | 0,
        name: unit.organizationName
    }));

    return immutable.fromJS(parsed);
};
