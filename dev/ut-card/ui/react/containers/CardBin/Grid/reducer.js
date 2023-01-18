import immutable from 'immutable';
import * as actionTypes from './actionTypes';
import {methodRequestState} from './../../constants';

const defaultCardsState = immutable.fromJS({
    fields: [
        {title: 'Id', name: 'binId'},
        {title: 'Description', name: 'description'},
        {title: 'Start BIN', name: 'startBin'},
        {title: 'End BIN', name: 'endBin'},
        {title: 'BIN Ownership', name: 'ownershipTypeName'},
        {title: 'Status', name: 'isActive'}
    ],
    bins: [],
    checkedRows: {},
    isGridLoading: false,
    checkedRowsChangeId: 0, // used to show gridtoolbox filters or buttons
    changeId: 0 // used to refetch grid data
});

export function cardBinsGrid(state = defaultCardsState, action) {
    switch (action.type) {
        case actionTypes.FETCH_BINS:
            if (action.methodRequestState === methodRequestState.REQUESTED) {
                return state.set('isGridLoading', true);
            } else if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                action.result.bin.forEach((value) => {
                    if (value.ownershipTypeName === 'own') {
                        value.endBin = null;
                    }
                });
                let bins = immutable.fromJS(action.result.bin);
                return state
                    .set('bins', bins)
                    .set('checkedRows', defaultCardsState.get('checkedRows'))
                    .set('isGridLoading', false);
            }
            return state;
        // case actionTypes.SET_VISIBLE_COLUMNS:
        //     let invisibleColumns = getStorageColumns(propInStorage);
        //     let fieldsWithVisibility = state.get('fields').map((f) => {
        //         if (invisibleColumns.includes(f.get('name'))) {
        //             return f.set('visible', false);
        //         }
        //         return f;
        //     });
        //     return state.set('fields', fieldsWithVisibility);
        // case actionTypes.TOGGLE_VISIBLE_COLUMN:
        //     return state.update('fields', (fields) => {
        //         return fields.map((f) => {
        //             if (action.field.name === f.get('name')) {
        //                 toggleColumnInStorage(propInStorage, action.field.name);
        //                 return f.set('visible', !action.field.visible);
        //             }
        //             return f;
        //         });
        //     });
        case actionTypes.CHECK_BIN:
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
                    .set('checkedRows', state.get('bins').toMap())
                    .update('checkedRowsChangeId', (v) => (v + 1));
            }
    }

    return state;
}

export default { cardBinsGrid };
