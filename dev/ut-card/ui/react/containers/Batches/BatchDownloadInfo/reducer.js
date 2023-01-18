import { actionsList } from './actions';
import immutable from 'immutable';

const defaultState = immutable.fromJS({
    actionStatusLinkHref: undefined,
    confirmationMessage: '',
    confirmationDialogOpened: false,
    downloadFile: false,
    areAllCardsGeneratedUpdateInfo: {
        do: false,
        checkedIdx: undefined,
        batchId: undefined,
        value: undefined
    }
});

export function batchDownloadInfo(state = defaultState, action) {
    switch (action.type) {
        case actionsList.CHECK_DOWNLOAD:
            if (action.methodRequestState === 'finished' && action.result) {
                let result = action.result.batchCheckDownload.pop();
                let newState = immutable.fromJS({
                    actionStatusLinkHref: '',
                    confirmationMessage: '',
                    confirmationDialogOpened: false,
                    downloadFile: true,
                    areAllCardsGeneratedUpdateInfo: {
                        do: true,
                        checkedIdx: action.params.checkedIdx,
                        batchId: action.params.checkedIdx ? undefined : action.params.batchId,
                        value: true
                    }
                });
                if (result.generatedCards < result.totalCards) {
                    return state
                        .set('confirmationMessage', `There is still data being generated. Progress is ${result.generatedCards} of ${result.totalCards}. Please try again later.`)
                        .set('confirmationDialogOpened', true);
                }
                return newState;
            }
            return defaultState;
        case actionsList.RESET_STATE:
            return defaultState;
        case actionsList.SET_DOWNLOAD_LINK:
            if (action.params.batchId) {
                return state
                    .set('actionStatusLinkHref', `/rpc/batch/download/${action.params.batchId}`);
            }
            return state
                .set('actionStatusLinkHref', undefined);
        case actionsList.CLOSE_DIALOG:
            return state
                .set('confirmationDialogOpened', false);
    }
    return state;
}
