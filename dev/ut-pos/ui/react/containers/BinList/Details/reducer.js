import {fromJS} from 'immutable';
import {actionList} from './actions';

const defaultState = fromJS(
    {
        opened: false,
        rqId: 0,
        changeId: 0,
        dialogTitle: '',
        branches: [],
        trnOperation: [],
        cardBinList: [],
        cardProduct: [],
        initialValues: {
        },
        editableValues: {
            datePublished: new Date()
        },
        requiredFields:['luno'],
        errors: {}
    });

export const binListDetails = (state = defaultState, action) => {
    switch (action.type) {
        case actionList.FETCH_OPERATION:
            if (action.methodRequestState === 'finished' && action.result) {
                let trnOperation = action.result.items
                    .map(({value: key, display: name}) => ({key, name}));
                return state.setIn(['trnOperation'], fromJS(trnOperation));
            }
            return state;
        case actionList.FECTH_CARDPRODUCT:
            if (action.methodRequestState === 'finished' && action.result) {
                let cardProduct = action.result.items
                    .map(({value: key, display: name}) => ({key, name}));        
                return state.setIn(['cardProduct'], fromJS(cardProduct));
            }
            return state;
        case actionList.FETCH_CARDBINLIST:
                if (action.methodRequestState === 'finished' && action.result) {
                    let cardBinList = action.result.bin
                     .map(({binId: key, description: name}) => ({key, name}));;
                    return state.setIn(['cardBinList'], fromJS(cardBinList));
                }
                return state;
        case actionList.ADD_BINLIST:
            return state
                .set('opened', true)
                .set('dialogTitle', 'Add Bin List')
                .set('errors', fromJS({}));
        case actionList.EDIT_BINLIST:
            if (action.methodRequestState === 'finished' && action.reqId === state.get('reqId')) {
                let binList = action.result.binList.pop();
                binList.transaction = JSON.parse(binList.transaction);
                let data = fromJS(binList);
                return state
                    .set('opened', true)
                    .set('initialValues', data)
                    .set('editableValues', data)
                    .set('dialogTitle', 'Edit Bin List')
                    .set('errors', fromJS({}));
            } else {
                return state.set('reqId', action.reqId);
            }
        case actionList.SAVE_BINLIST:
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
        case actionList.CHANGE_FILE:
            return state
                .setIn(['editableValues', 'attachment'], action.attachment);
        case actionList.SET_ERRORS:
            return state
                .setIn(['errors'], fromJS(action.params.form));
        default:
            break;
    }
    return state;
};
