import {Map} from 'immutable';
import {actionList} from './actions';

const cardInUseDef = Map({changeId: 0});
export const cardInUse = (state = cardInUseDef, action) => {
    if (actionList.RESET_PIN_RETRIES === action.type && action.methodRequestState === 'finished' && action.result) {
        return state
            .update('changeId', (v) => (v + 1));
    }
    return state;
};
