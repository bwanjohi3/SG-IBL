import immutable from 'immutable';
import * as actionTypes from './actionTypes';
import {methodRequestState} from './../../../constants';
import {UPDATE_CLOSE_REFETCH} from './../actionTypes';
import {updateError} from './../../helpers';

const defaultCardsApplicationCreateBatch = immutable.fromJS({
    open: false,
    batchName: '',
    targetBranchId: '',
    businessUnits: [],
    applications: [],
    checked: {},
    disabled: false,
    errors: {}
});

export function cardApplicationCreateBatch(state = defaultCardsApplicationCreateBatch, action) {
    switch (action.type) {
        case actionTypes.OPEN_CREATE_BATCH_DIALOG:
            let checked = action.applications.reduce((result, item) => {
                return result.set(item.get('applicationId'), item);
            }, immutable.Map());

            return state
                .set('open', true)
                .set('disabled', action.disabled)
                .set('applications', action.applications)
                .set('checked', checked);
        case actionTypes.CHECK_APPLICATION:
            if (!action.params.state) { // add
                return state
                    .setIn(['checked', action.params.row.applicationId], immutable.fromJS(action.params.row))
                    .deleteIn(['errors', 'checked']);
            } else { // remove
                return state
                    .deleteIn(['checked', action.params.row.applicationId]);
            }
        case actionTypes.FETCH_BUSINESS_UNITS:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let units = action.result.allBranches.map(function(branch) {
                    return {key: branch.actorId, name: branch.organizationName};
                });
                return state.set('businessUnits', immutable.fromJS(units));
            }
            break;
        case actionTypes.CLOSE_CREATE_BATCH_DIALOG:
            return defaultCardsApplicationCreateBatch;
        case actionTypes.CHANGE_BATCH_NAME:
            let newErrors = updateError(action, state.get('errors'));
            return state
                .set('batchName', action.params.value)
                .set('errors', newErrors);
        case actionTypes.CHANGE_BUSINESS_UNIT:
            let errorsToSet = updateError(action, state.get('errors'));
            return state
                .set('targetBranchId', action.params.value)
                .set('errors', errorsToSet);
        case actionTypes.CREATE_BATCH:
            return state;
        case UPDATE_CLOSE_REFETCH:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                return defaultCardsApplicationCreateBatch;
            }
            break;
        case actionTypes.SET_ERRORS:
            return state
                .mergeDeepIn(['errors'], immutable.fromJS(action.params.form));
    }

    return state;
}
