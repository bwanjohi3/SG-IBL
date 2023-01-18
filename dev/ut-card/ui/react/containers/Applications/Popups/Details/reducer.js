import immutable from 'immutable';
import * as actionTypes from './actionTypes';
import {methodRequestState} from './../../../constants';
import {UPDATE_CLOSE_REFETCH} from './../actionTypes';
import {updateError} from './../../helpers';

const defaultCardsApplicationsDetails = immutable.fromJS({
    open: false,
    remoteData: {},
    data: {},
    products: [],
    units: [],
    errors: {}
});

export function cardApplicationDetails(state = defaultCardsApplicationsDetails, action) {
    switch (action.type) {
        case actionTypes.TOGGLE_DETAILS_DIALOG:
            let newOpenedState = !state.get('open');
            return defaultCardsApplicationsDetails.set('open', newOpenedState);
        case actionTypes.CLOSE_DETAILS_DIALOG:
            return defaultCardsApplicationsDetails;
        case actionTypes.FETCH_APPLICATION_DETAILS:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let newOpenedState = !state.get('open');
                let newData = immutable.fromJS(action.result.application[0]);
                let newState = defaultCardsApplicationsDetails
                    .set('open', newOpenedState)
                    .set('data', newData)
                    .set('remoteData', newData)
                    .setIn(['products', '0'], immutable.fromJS({
                        key: newData.get('productId'),
                        name: newData.get('productName'),
                        accountLinkLimit: newData.get('accountLinkLimit')
                    }));
                return newState;
            }
            break;
        case UPDATE_CLOSE_REFETCH:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                return defaultCardsApplicationsDetails;
            }
            break;
        case actionTypes.FETCH_BUSINESS_UNITS:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let units = action.result.allBranches.map(function(branch) {
                    return {key: branch.actorId, name: branch.organizationName};
                });
                return state.set('units', immutable.fromJS(units));
            }
            break;
        case actionTypes.CHANGE_DROPDOWN:
            return state.setIn(['data', action.params.key], action.params.value);
        case actionTypes.CHANGE_CARDHOLDER_NAME:
            let newErrors = updateError(action, state.get('errors'));
            return state
                .setIn(['data', 'holderName'], action.params.value.toUpperCase())
                .set('errors', newErrors);
        case actionTypes.CHANGE_MAKER_COMMENT:
            return state
                .setIn(['data', 'makerComments'], action.params.value);
        case actionTypes.SET_ERRORS:
            return state
                .mergeDeepIn(['errors'], immutable.fromJS(action.params.form));
    }

    return state;
}
