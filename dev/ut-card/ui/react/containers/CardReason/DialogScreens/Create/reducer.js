import { actionList } from './actions';
import immutable from 'immutable';

const FINISHED = 'finished'; // from methodRequestState
// const REQUESTED = 'requested';
const defaultState = {
    open: false,
    input: {
        module: '',
        actions: immutable.List(),
        reasonName: '',
        isActive: 1
    },
    actionList: immutable.List(),
    changeId: 0
};

const defaultStateImmutable = immutable.fromJS(defaultState);

export function cardReasonCreateDialog(state = defaultStateImmutable, action) {
    switch (action.type) {
        case actionList.FETCH_ACTIONS:
            if (action.methodRequestState === FINISHED && action.result) {
                return state
                    .set('actionList', immutable.fromJS(action.result));
            }
            break;
        case actionList.TOGGLE:
            if (state.get('open')) {
                state = state
                    .set('input', defaultStateImmutable.get('input'));
            }
            return state
                .set('open', !state.get('open'));
        case actionList.CREATE:
            if (action.methodRequestState === FINISHED && action.result) {
                return state
                    .set('input', defaultStateImmutable.get('input'))
                    .update('changeId', (v) => (v + 1))
                    .set('open', !state.get('open'));
            }
            break;
        case actionList.SET:
            if (action.params.key === 'module' && action.params.value !== state.getIn(['input', 'module'])) {
                state = state
                    .setIn(['input', 'actions'], defaultStateImmutable.getIn(['input', 'actions']));
            }

            return state
                .setIn(['input', action.params.key], immutable.fromJS(action.params.value));
    }
    return state;
};
