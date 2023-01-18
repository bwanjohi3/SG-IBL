import {Map} from 'immutable';
import {actionList} from './actions';

const defaultState = Map({
    changeId: 0,
    filtersOpened: true // if true - filters are opened, if false - buttons are opened
});

export const batchesToolboxToolbox = (state = defaultState, action) => {
    switch (action.type) {
        case actionList.TOGGLE:
            return state
                .update('filtersOpened', (v) => (!v));
        case actionList.SET:
            return state
                .set('filtersOpened', action.filtersOpened);
        default:
            return state;
    }
};
