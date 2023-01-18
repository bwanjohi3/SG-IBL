import immutable from 'immutable';
import * as actionTypes from './actionTypes';
import {SET_ERRORS, FETCH_DOCUMENT_TYPES} from './../actionTypes';
import {methodRequestState} from './../../../constants';

const defaultAttachment = immutable.fromJS({
    content: '',
    isNew: false,
    filename: '',
    contentType: '',
    contentEncoding: '',
    documentTypeId: undefined
});

const defaultCardsApplicationsCreateUploads = immutable.fromJS({
    types: [],
    attachments: [defaultAttachment],
    errors: {}
});

export function cardNoNameApplicationUploads(state = defaultCardsApplicationsCreateUploads, action) {
    switch (action.type) {
        case actionTypes.TYPE_CHANGE:
            return state
                .setIn(['attachments', action.params.index, 'documentTypeId'], action.params.data.value)
                .deleteIn(['errors', action.params.index]);
        case actionTypes.CHANGE_FILE:
            return state.mergeDeepIn(['attachments', action.params.index], immutable.fromJS(action.params.attachment));
        case actionTypes.REMOVE_FILE:
            return state.deleteIn(['attachments', action.params.index]);
        case actionTypes.ADD_FILE:
            let newAttachments = state.get('attachments').push(defaultAttachment);
            return state.set('attachments', newAttachments);
        case SET_ERRORS:
            return state.mergeDeepIn(['errors'], action.params.upload);
        case FETCH_DOCUMENT_TYPES:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                return state.set('types', immutable.fromJS(action.result[0]));
            }
            break;
        case actionTypes.CLEAR:
            return defaultCardsApplicationsCreateUploads;
    }

    return state;
}
