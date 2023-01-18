import { actionsList } from './actions';
import immutable from 'immutable';

const defaultState = {
    changeId: 0
};

const defaultStateImmutable = immutable.fromJS(defaultState);

export function cardActionDialogScreens(state = defaultStateImmutable, action) {
    switch (action.type) {
        case actionsList.UPDATE_PAGE:
            return state
                .update('changeId', (v) => (v + 1));
    }
    return state;
}
export default {cardActionDialogScreens};
