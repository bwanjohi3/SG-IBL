import {fromJS} from 'immutable';
import {actionList} from './actions';

const defaultState = fromJS(
    {
        opened: false,
        rqId: 0,
        changeId: 0,
        dialogTitle: '',
        branches: [],
        keyChainList:[],
        fwList:[],
        initialValues: {
        },
        editableValues: {
        },
        requiredFields:['luno'],
        errors: {}
    });

export const posDetails = (state = defaultState, action) => {
    switch (action.type) {
        case actionList.ADD_POS:
            return state
                .set('opened', true)
                .set('dialogTitle', 'Add POS')
                .set('errors', fromJS({}));
        case actionList.EDIT_POS:
            if (action.methodRequestState === 'finished' && action.reqId === state.get('reqId')) {
                let terminal = action.result.terminal.pop();
                terminal.address = (terminal.location && terminal.location.substr(0,23).trim()) || '';
                terminal.city = (terminal.location && terminal.location.substr(23,12).trim())  || '' ;
                let data = fromJS(terminal);
                return state
                    .set('opened', true)
                    .set('initialValues', data)
                    .set('editableValues', data)
                    .set('dialogTitle', 'Edit POS')
                    .set('errors', fromJS({}));
            } else {
                return state.set('reqId', action.reqId);
            }
        case actionList.SAVE_POS:
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
         if (typeof action.key === "string") {
            return state
                .setIn(['editableValues', action.key], action.value)
                .deleteIn(['errors', `${action.key}`]);
         } else {
            action.key.forEach(k => state = state.setIn(['editableValues', k], action.value));
            return state.deleteIn(['errors', `${action.key}`]);
         }
        case actionList.FETCH_BRANCHES:
            if (action.methodRequestState === 'finished' && action.result) {
                let branches = action.result.allBranches.map(function(branch) {
                    return {key: branch.actorId, name: branch.organizationName};
                });
                return state.setIn(['branches'], fromJS(branches));
            }
            return state;
        case actionList.FETCH_KEYS:
            if (action.methodRequestState === 'finished' && action.result) {
                let keysData = action.result.keyChainList.map(function(keyChain) {
                    return {key: keyChain.keyChainId, name: keyChain.name};
                });
                return state.setIn(['keyChainList'], fromJS(keysData));
            }
            return state;
        case actionList.FETCH_FW:
            if (action.methodRequestState === 'finished' && action.result) {
                let fwData = action.result.apps.map(function(fwItem) {
                    return {key: fwItem.appId, name: fwItem.name, version: fwItem.version};
                });
                return state.setIn(['fwList'], fromJS(fwData));
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
