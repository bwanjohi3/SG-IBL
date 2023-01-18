import {Map} from 'immutable';
import {actionList} from './actions';

const defaultState = Map({
    changeId: 0,
    filters: Map({opened: true}),
    buttons: Map({opened: false})
});

export const cardManagementGridToolbox = (state = defaultState, action) => {
    if (action.type === actionList.TOGGLE) {
        return state
            .updateIn(['filters', 'opened'], (v) => (!v))
            .updateIn(['buttons', 'opened'], (v) => (!v));
    } else if (action.type === actionList.SHOW_BUTTONS) {
        return state
            .setIn(['filters', 'opened'], false)
            .setIn(['buttons', 'opened'], true);
    } else if (action.type === actionList.SHOW_FILTERS) {
        return state
            .setIn(['buttons', 'opened'], false)
            .setIn(['filters', 'opened'], true);
    }
    return state;
};
