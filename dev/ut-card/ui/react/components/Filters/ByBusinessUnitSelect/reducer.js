import {fromJS} from 'immutable';
import {actionList} from './actions';
export function parseBusinessUnits(units) {
    let parsed = units.map((unit) => ({
        key: unit.actorId | 0,
        name: unit.organizationName
    }));

    return fromJS(parsed);
};

const defaultState = {
    units: []
};
const defaultStateImmutable = fromJS(defaultState);
const FINISHED = 'finished';

export function cardsFilterByBusinessUnitSelect(state = defaultStateImmutable, action) {
    switch (action.type) {
        case actionList.FETCH:
            if (action.result && action.methodRequestState === FINISHED) {
                return state
                    .set('units', parseBusinessUnits(action.result.allBranches));
            }
            return state;
    }
    return state;
};
