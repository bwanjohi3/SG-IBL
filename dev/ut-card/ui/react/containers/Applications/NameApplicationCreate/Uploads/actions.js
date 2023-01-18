import * as actionTypes from './actionTypes';

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
