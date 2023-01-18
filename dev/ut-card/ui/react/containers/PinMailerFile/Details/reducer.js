import {fromJS} from 'immutable';
import {actionList} from './actions';

const defaultAttachment = fromJS({
    content: '',
    isNew: false,
    filename: '',
    contentType: '',
    contentEncoding: '',
    documentTypeId: undefined
});

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
            datePublished: new Date()
        },
        requiredFields:['luno'],
        errors: {}
    });

export const pinMailerFileDetails = (state = defaultState, action) => {
    switch (action.type) {
        case actionList.ADD_APPLICATION:
            return state
                .set('opened', true)
                .set('dialogTitle', 'Pin Mailer File')
                .set('errors', fromJS({}));
        case actionList.EDIT_APPLICATION:
            if (action.methodRequestState === 'finished' && action.reqId === state.get('reqId')) {
                let data = fromJS(action.result.app.pop());
                return state
                    .set('opened', true)
                    .set('initialValues', data)
                    .set('editableValues', data)
                    .set('dialogTitle', 'Edit Application')
                    .set('errors', fromJS({}));
            } else {
                return state.set('reqId', action.reqId);
            }
        case actionList.SAVE_APPLICATION:
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
                .setIn(['editableValues', action.fieldName], action.attachment);
        case actionList.SET_ERRORS:
            return state
                .setIn(['errors'], fromJS(action.params.form));
        default:
            break;
    }
    return state;
};
