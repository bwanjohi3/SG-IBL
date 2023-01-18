import immutable from 'immutable';
import * as actionTypes from './actionTypes';
import {UPDATE_CLOSE_REFETCH} from './../Popups/actionTypes';
import {methodRequestState} from './../../constants';
import {getStorageColumns, toggleColumnInStorage} from 'ut-front-react/components/SimpleGrid/helpers';
import style from './style.css';

const propInStorage = 'cardApplications';

const defaultCardsState = immutable.fromJS({
    fields: [
        {title: 'Application Number', name: 'applicationId'},
        {title: 'Card Number', name: 'cardnumber'},
        {title: 'Person Name', name: 'personName'},
        {title: 'Customer Name', name: 'customerName'},
        {title: 'Application Type', name: 'embossedTypeName'},
        {title: 'Card Product', name: 'productName'},
        {title: 'Card Type', name: 'typeName'},
        {title: 'Batch Name', name: 'batchName', className: style.batchName},
        {title: 'Current Business Unit', name: 'currentBranchName'},
        {title: 'Issuing Business Unit', name: 'issuingBranchName'},
        {title: 'Target Business Unit', name: 'targetBranchName'},
        {title: 'Created On', name: 'createdOn'},
        {title: 'Status', name: 'statusName'}
    ],
    applications: [],
    checkedRows: {},
    isGridLoading: false,
    checkedRowsChangeId: 0, // used to show gridtoolbox filters or buttons
    changeId: 0 // used to refetch grid data
});

export function cardApplicationsGrid(state = defaultCardsState, action) {
    switch (action.type) {
        case actionTypes.FETCH_APPLICATIONS:
            if (action.methodRequestState === methodRequestState.REQUESTED) {
                return state.set('isGridLoading', true);
            } else if (action.methodRequestState === methodRequestState.FINISHED) {
                if (action.result) {
                    let applications = immutable.fromJS(action.result.applications);
                    return state
                        .set('applications', applications)
                        .set('checkedRows', defaultCardsState.get('checkedRows'))
                        .set('isGridLoading', false);
                } else if (action.error) {
                    return state
                        .set('checkedRows', defaultCardsState.get('checkedRows'))
                        .set('isGridLoading', false);
                }
            }
            return state;
        case actionTypes.SET_VISIBLE_COLUMNS:
            let invisibleColumns = getStorageColumns(propInStorage);
            let fieldsWithVisibility = state.get('fields').map((f) => {
                if (invisibleColumns.includes(f.get('name'))) {
                    return f.set('visible', false);
                }
                return f;
            });
            return state.set('fields', fieldsWithVisibility);
        case actionTypes.TOGGLE_VISIBLE_COLUMN:
            return state.update('fields', (fields) => {
                return fields.map((f) => {
                    if (action.field.name === f.get('name')) {
                        toggleColumnInStorage(propInStorage, action.field.name);
                        return f.set('visible', !action.field.visible);
                    }
                    return f;
                });
            });
        case actionTypes.CHECK_APPLICATION:
            if (!action.params.state) { // add
                return state
                    .update('checkedRows', (v) => (action.params.cleanup ? immutable.Map() : v)) // if cleanup is set, remove all checked rows
                    .setIn(['checkedRows', action.params.rowIdx], immutable.fromJS(action.params.row))
                    .update('checkedRowsChangeId', (v) => (v + 1));
            } else { // remove
                return state
                    .deleteIn(['checkedRows', action.params.rowIdx])
                    .update('checkedRowsChangeId', (v) => (v + 1));
            }
        case actionTypes.MULTI_CHECK:
            if (action.params.currentState) {
                return state
                    .set('checkedRows', immutable.Map())
                    .update('checkedRowsChangeId', (v) => (v + 1));
            } else {
                return state
                    .set('checkedRows', state.get('applications').toMap())
                    .update('checkedRowsChangeId', (v) => (v + 1));
            }
        case actionTypes.REFETCH:
            return state.set('changeId', state.get('changeId') + 1);
        case UPDATE_CLOSE_REFETCH:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                return state.set('changeId', state.get('changeId') + 1);
            }
    }

    return state;
}

export default { cardApplicationsGrid };
