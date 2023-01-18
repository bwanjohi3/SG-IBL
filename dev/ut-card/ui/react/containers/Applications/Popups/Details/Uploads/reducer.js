import immutable from 'immutable';
import * as actionTypes from './actionTypes';
import {FETCH_APPLICATION_DETAILS, FETCH_DOCUMENT_TYPES, SET_ERRORS} from './../actionTypes';
import {methodRequestState} from './../../../../constants';

const defaultAttachment = immutable.fromJS({
    isNew: false,
    filename: '',
    content: '',
    contentType: '',
    contentEncoding: '',
    documentTypeId: undefined
});

const cardApplicationDetailsUploadsDefaultState = immutable.fromJS({
    types: [],
    attachments: [],
    remoteAttachments: []
});

export function cardApplicationDetailsUploads(state = cardApplicationDetailsUploadsDefaultState, action) {
    switch (action.type) {
        case FETCH_APPLICATION_DETAILS:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let attachmentsToSet = immutable.fromJS(action.result.documents);
                let typesToSet = attachmentsToSet.map((attachment) => {
                    return {
                        key: attachment.get('documentTypeId'),
                        name: attachment.get('documentTypeId')
                    };
                });
                return state
                    .set('attachments', attachmentsToSet)
                    .set('remoteAttachments', attachmentsToSet)
                    .set('types', typesToSet);
            }
            break;
        case FETCH_DOCUMENT_TYPES:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                return state.set('types', immutable.fromJS(action.result[0]));
            }
            break;
        case actionTypes.TYPE_CHANGE:
            return state
                .setIn(['attachments', action.params.index, 'documentTypeId'], action.params.data.value)
                .setIn(['attachments', action.params.index, 'isNew'], true)
                .deleteIn(['errors', action.params.index]);
        case actionTypes.CHANGE_FILE:
            let newAttachment = immutable.fromJS(action.params.attachment);
            let documentTypeId = state.getIn(['attachments', action.params.index, 'documentTypeId']);
            if (documentTypeId) {
                newAttachment = newAttachment.set('documentTypeId', documentTypeId);
            }
            return state.setIn(['attachments', action.params.index], newAttachment);
        case actionTypes.REMOVE_FILE:
            return state.deleteIn(['attachments', action.params.index]);
        case actionTypes.ADD_FILE:
            let newAttachments = state.get('attachments').push(defaultAttachment);
            return state.set('attachments', newAttachments);
        case SET_ERRORS:
            return state.mergeDeepIn(['errors'], action.params.upload);
        case actionTypes.CLEAR:
            return cardApplicationDetailsUploadsDefaultState;
    }

    return state;
}
