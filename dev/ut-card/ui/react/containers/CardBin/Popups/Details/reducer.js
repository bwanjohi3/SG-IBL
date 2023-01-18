import immutable from 'immutable';
import * as actionTypes from './actionTypes';
import {methodRequestState} from './../../../constants';
import {updateError} from './../../helpers';

const defaultCardBinssDetails = immutable.fromJS({
    open: false,
    remoteData: {},
    data: {
        ownershipTypeId: 0,
        startBin: '',
        endBin: ''
    },
    errors: {},
    changeId: 0,
    internalChangeId: 0
});

export function cardBinDetails(state = defaultCardBinssDetails, action) {
    switch (action.type) {
        case actionTypes.OPEN_DETAILS_DIALOG:
            return defaultCardBinssDetails.set('open', true);
        case actionTypes.CLOSE_DETAILS_DIALOG:
            return defaultCardBinssDetails;
        case actionTypes.FETCH_BIN_DETAILS:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let newData = immutable.fromJS(action.result.cardBin[0]);
                newData = newData
                    .set('ownershipTypeId', parseInt(newData.get('ownershipTypeId')))
                    .set('startBin', parseInt(newData.get('startBin')))
                    .set('endBin', parseInt(newData.get('endBin')));
                let newState = defaultCardBinssDetails
                    .set('open', true)
                    .set('data', newData)
                    .set('remoteData', newData)
                    .set('internalChangeId', state.get('internalChangeId') + 1);
                return newState;
            }
            break;
        case actionTypes.CHANGE_OWNERSHIP:
            let newErrors = updateError(action, state.get('errors'));
            return state
                .setIn(['data', 'ownershipTypeId'], action.params.value)
                .set('errors', newErrors)
                .set('internalChangeId', state.get('internalChangeId') + 1);
        case actionTypes.CHANGE_DESCRIPTION:
            let newErrorsDesc = updateError(action, state.get('errors'));
            return state
                .setIn(['data', 'description'], action.params.value)
                .set('errors', newErrorsDesc)
                .set('internalChangeId', state.get('internalChangeId') + 1);
        case actionTypes.CHANGE_START_BIN:
            let newErrorsStartBin = updateError(action, state.get('errors'));
            return state
                .setIn(['data', 'startBin'], action.params.value)
                .set('errors', newErrorsStartBin)
                .set('internalChangeId', state.get('internalChangeId') + 1);
        case actionTypes.CHANGE_END_BIN:
            let newErrorsEndBin = updateError(action, state.get('errors'));
            return state
                .setIn(['data', 'endBin'], action.params.value)
                .set('errors', newErrorsEndBin)
                .set('internalChangeId', state.get('internalChangeId') + 1);
        case actionTypes.EDIT_BIN:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let newState = defaultCardBinssDetails
                    .set('changeId', state.get('changeId') + 1);
                return newState;
            }
            break;
        case actionTypes.STATUS_UPDATE_BIN:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let newState = defaultCardBinssDetails
                    .set('changeId', state.get('changeId') + 1);
                return newState;
            }
            break;
        case actionTypes.SET_ERRORS:
            return state
                .mergeDeepIn(['errors'], immutable.fromJS(action.params.form))
                .set('internalChangeId', state.get('internalChangeId') + 1);
    }

    return state;
}
