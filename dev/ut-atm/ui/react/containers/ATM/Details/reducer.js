import {fromJS} from 'immutable';
import {actionList} from './actions';

const defaultState = fromJS(
    {
        opened: false,
        rqId: 0,
        changeId: 0,
        dialogTitle: '',
        branches: [],
        initialValues: {
        },
        editableValues: {
        },
        requiredFields:['luno'],
        errors: {}
    });

export const atmDetails = (state = defaultState, action) => {
    switch (action.type) {
        case actionList.ADD_ATM:
            return state
                .set('opened', true)
                .set('dialogTitle', 'Add ATM')
                .set('errors', fromJS({}));
        case actionList.EDIT_ATM:
            if (action.methodRequestState === 'finished' && action.reqId === state.get('reqId')) {
                let data = fromJS(action.result.terminal.pop());
                return state
                    .set('opened', true)
                    .set('initialValues', data)
                    .set('editableValues', data)
                    .set('dialogTitle', 'Edit ATM')
                    .set('errors', fromJS({}));
            } else {
                return state.set('reqId', action.reqId);
            }
        case actionList.SAVE_ATM:
            // TODO: add insert/update proc here
            if (action.methodRequestState === 'requested' && action.params) {
                return state
                    .set('errors', fromJS({}));
            }
            if (action.methodRequestState === 'finished' && action.result) {
                return state
                    .set('opened', false)
                    .set('editableValues', fromJS({}))
                    .set('initialValues', fromJS({}))
                    .update('changeId', (v) => (v + 1));
            }
            return state;
        case actionList.CLOSE:
            return state
                .set('opened', false)
                .set('editableValues', fromJS({}))
                .set('initialValues', fromJS({}))
                .set('errors', fromJS({}));
        // input fields actions - left
        case actionList.SET_FIELD_VALUE:
            return state
                .setIn(['editableValues', action.key], action.value)
                .deleteIn(['errors', `${action.key}`]);
        case actionList.FETCH_BRANCHES:
            if (action.methodRequestState === 'finished' && action.result) {
                let branches = action.result.allBranches.map(function(branch) {
                    return {key: branch.actorId, name: branch.organizationName};
                });
                return state.setIn(['branches'], fromJS(branches));
            }
            return state;
        case actionList.SET_ERRORS:
            return state
                .setIn(['errors'], fromJS(action.params.form));
        default:
            break;
    }
    return state;
};
