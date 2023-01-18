import immutable from 'immutable';
import * as actionTypes from './actionTypes';
import {UPDATE_CLOSE_REFETCH} from './../actionTypes';
import {methodRequestState} from './../../../constants';
import {updateError} from './../../helpers';

const defaultCardsApplicationAddToExistingBatch = immutable.fromJS({
    open: false,
    batchId: undefined,
    batches: [],
    applications: [],
    checked: [],
    disabled: false,
    errors: {}
});

export function cardApplicationAddToExistingBatch(state = defaultCardsApplicationAddToExistingBatch, action) {
    switch (action.type) {
        case actionTypes.OPEN_ADD_TO_EXISTING_BATCH_DIALOG:
            return defaultCardsApplicationAddToExistingBatch
                .set('open', true)
                .set('disabled', action.disabled)
                .set('applications', action.applications)
                .set('checked', action.applications);
        case actionTypes.CLOSE_ADD_TO_EXISTING_BATCH_DIALOG:
            return defaultCardsApplicationAddToExistingBatch;
        case actionTypes.FETCH_BATCHES:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let batches = immutable.fromJS(action.result[0].map((batch) => {
                    return {
                        key: batch.batchId,
                        name: batch.batchName
                    };
                }));
                return state.set('batches', batches);
            }
            break;
        case actionTypes.CHANGE_BATCH:
            let newErrors = updateError(action, state.get('errors'));
            return state
                .set('batchId', action.params.value)
                .set('errors', newErrors);
        case actionTypes.CHECK_APPLICATION:
            if (!action.params.state) { // add
                return state
                    .set('checked', state.get('checked').push(immutable.fromJS(action.params.row)))
                    .deleteIn(['errors', 'checked']);
            } else { // remove
                let newChecked = state.get('checked').filter((checked) => {
                    return checked.get('applicationId') !== action.params.row.applicationId;
                });
                return state.set('checked', newChecked);
            }
        case actionTypes.ADD_TO_BATCH:
            return state;
        case UPDATE_CLOSE_REFETCH:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                return defaultCardsApplicationAddToExistingBatch;
            }
            break;
        case actionTypes.SET_ERRORS:
            return state
                .mergeDeepIn(['errors'], immutable.fromJS(action.params.form));
    }

    return state;
}
