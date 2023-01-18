import * as actionTypes from './actionTypes';
import {prepareApplicationDataForUpdate} from './../helpers';

// used for managing closing all popups and refetch grid data when update is provided
export function updateCloseRefetch(application, applicationActionId, batch, account, attachment, newAttachments, document) {
    let reducedApplicationData = prepareApplicationDataForUpdate(application);
    return {
        type: actionTypes.UPDATE_CLOSE_REFETCH,
        method: 'card.application.statusUpdate',
        params: {
            application: reducedApplicationData,
            applicationActionId,
            batch,
            account,
            attachment,
            newAttachments,
            document
        }
    };
}
