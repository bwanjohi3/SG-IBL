import immutable from 'immutable';
import * as actionTypes from './actionTypes';
import {methodRequestState} from './../../../constants';
import {updateError} from './../../helpers';

const defaultCardsBinCreateState = immutable.fromJS({
    ownershipTypes: immutable.List(),
    open: false,
    ownershipTypeId: 0,
    description: '',
    startBin: null,
    endBin: null,
    errors: {},
    changeId: 0
});

export function cardBinCreate(state = defaultCardsBinCreateState, action) {
    switch (action.type) {
        case actionTypes.OPEN_CREATE_BIN_DIALOG:
            return state
                .set('open', true);
        case actionTypes.CLOSE_CREATE_BIN_DIALOG:
            return defaultCardsBinCreateState
                .set('ownershipTypes', state.get('ownershipTypes'));
        case actionTypes.FETCH_OWNERSHIP_TYPES:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let ownershipTypes = immutable.fromJS(action.result.ownershipType.map((type) => {
                    return {
                        key: parseInt(type.ownershipTypeId),
                        name: type.ownershipTypeName
                    };
                }));
                return state.set('ownershipTypes', ownershipTypes);
            }
            break;
        case actionTypes.HANDLE_OWNERHIP_TYPE_CHANGE:
            return state
                .set('ownershipTypeId', action.value)
                .set('startBin', defaultCardsBinCreateState.get('startBin'))
                .set('endBin', defaultCardsBinCreateState.get('endBin'))
                .set('errors', defaultCardsBinCreateState.get('errors'));
        case actionTypes.CHANGE_START_BIN:
            let newErrorsStartBin = updateError(action, state.get('errors'));
            return state
                .set('startBin', parseInt(action.params.value))
                .set('errors', newErrorsStartBin);
        case actionTypes.CHANGE_END_BIN:
            let newErrorsEndBin = updateError(action, state.get('errors'));
            return state
                .set('endBin', parseInt(action.params.value))
                .set('errors', newErrorsEndBin);
        case actionTypes.CHANGE_BIN_DESCRIPTION:
            let newErrorsDesc = updateError(action, state.get('errors'));
            return state
                .set('description', action.params.value)
                .set('errors', newErrorsDesc);
        case actionTypes.CREATE_BIN:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                return defaultCardsBinCreateState
                    .set('changeId', state.get('changeId') + 1)
                    .set('ownershipTypes', state.get('ownershipTypes'));
            }
            break;
        case actionTypes.SET_ERRORS:
            return state
                .mergeDeepIn(['errors'], immutable.fromJS(action.params.form));
    }

    return state;
}
