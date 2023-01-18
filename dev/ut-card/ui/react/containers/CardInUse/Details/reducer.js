import {Map, List, fromJS} from 'immutable';
import {actionList} from './actions';

const cardInUseDetailsInitialState = Map({
    id: 0,
    changeId: 0,
    cardInfo: List()
});

export const cardInUseDetails = (state = cardInUseDetailsInitialState, action) => {
    switch (action.type) {
        case actionList.CLOSE:
            return state
                .set('data', Map())
                .set('id', 0);
        case actionList.FETCH:
            if (action.methodRequestState === 'finished' && action.result) {
                let result = fromJS(action.result.cardInUse);

                return state
                    .set('id', parseInt(result.get('cardId')))
                    .update('changeId', (v) => (v + 1))
                    .setIn(['cardInfo', 0], result);
            }
            return state;
        default:
            return state;
    }
};
