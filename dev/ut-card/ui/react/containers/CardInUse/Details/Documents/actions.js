export const actionTypes = {
    FETCH_DOCUMENT_TYPES: Symbol('FETCH_DOCUMENT_TYPES'),
    TYPE_CHANGE: Symbol('TYPE_CHANGE'),
    CHANGE_FILE: Symbol('CHANGE_FILE'),
    REMOVE_FILE: Symbol('REMOVE_FILE'),
    ADD_FILE: Symbol('ADD_FILE'),
    CLEAR: Symbol('CLEAR')
};

export const typeChange = (data, index) => ({
    type: actionTypes.TYPE_CHANGE,
    params: {
        data,
        index
    }
});

export const changeFile = (attachment, index) => ({
    type: actionTypes.CHANGE_FILE,
    params: {
        attachment,
        index
    }
});

export const removeUpload = (index) => ({
    type: actionTypes.REMOVE_FILE,
    params: {
        index
    }
});

export const onAddDocument = (index) => ({
    type: actionTypes.ADD_FILE,
    params: {
        index
    }
});

export const clearUploads = () => ({
    type: actionTypes.CLEAR
});

export function fetchDocumentTypes() {
    return {
        type: actionTypes.FETCH_DOCUMENT_TYPES,
        method: 'card.documentType.list',
        suppressPreloadWindow: true
    };
};
