export const actionsList = {
    'CHECK_DOWNLOAD': Symbol('CHECK_DOWNLOAD'),
    'RESET_STATE': Symbol('RESET_STATE'),
    'SET_DOWNLOAD_LINK': Symbol('SET_DOWNLOAD_LINK'),
    'CLOSE_DIALOG': Symbol('CLOSE_DIALOG')
};

export function checkDownload(batchId, checkedIdx) {
    return {
        type: actionsList.CHECK_DOWNLOAD,
        method: 'card.batch.checkDownload',
        params: {batchId, checkedIdx}
    };
};

export function resetState() {
    return {
        type: actionsList.RESET_STATE
    };
}

export function setDownloadLink(batchId) {
    return {
        type: actionsList.SET_DOWNLOAD_LINK,
        params: {batchId}
    };
}

export function closeDialog() {
    return {
        type: actionsList.CLOSE_DIALOG
    };
}
