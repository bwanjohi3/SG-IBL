import immutable from 'immutable';
import {actionTypes} from './actions';
import { actionList as detailsActions } from '../actions';

const defaultAttachment = immutable.fromJS({
    content: '',
    isNew: false,
    filename: '',
    contentType: '',
    contentEncoding: '',
    documentTypeId: undefined
});

const defaultStateImmutable = immutable.fromJS({
    types: [],
    attachments: [],
    changeId: 0
});

const FINISHED = 'finished';

export function cardInUseDocument(state = defaultStateImmutable, action) {
    switch (action.type) {
        case detailsActions.FETCH:
            if (action.methodRequestState === FINISHED && action.result) {
                let attachmentsToSet = immutable.fromJS(action.result.documents);
                return state
                    .set('attachments', attachmentsToSet);
            }
            break;
        case actionTypes.FETCH_DOCUMENT_TYPES:
            if (action.methodRequestState === FINISHED && action.result) {
                return state.set('types', immutable.fromJS(action.result[0]));
            }
            break;
        case actionTypes.TYPE_CHANGE:
            return state
                .setIn(['attachments', action.params.index, 'documentTypeId'], action.params.data.value)
                .update('changeId', (v) => (v + 1));
        case actionTypes.CHANGE_FILE:
            let newAttachment = immutable.fromJS(action.params.attachment);
            let documentTypeId = state.getIn(['attachments', action.params.index, 'documentTypeId']);
            if (documentTypeId) {
                newAttachment = newAttachment.set('documentTypeId', documentTypeId);
            }
            return state
                .setIn(['attachments', action.params.index], newAttachment)
                .update('changeId', (v) => (v + 1));
        case actionTypes.REMOVE_FILE:
            return state
                .deleteIn(['attachments', action.params.index])
                .update('changeId', (v) => (v + 1));
        case actionTypes.ADD_FILE:
            let newAttachments = state.get('attachments').push(defaultAttachment);
            return state
                .set('attachments', newAttachments)
                .update('changeId', (v) => (v + 1));
        case actionTypes.CLEAR:
            return defaultStateImmutable;
    }

    return state;
}
