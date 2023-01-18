import Immutable, {Map, List} from 'immutable';
import * as actionTypes from './actionTypes';
import {getStorageColumns, toggleColumnInStorage} from 'ut-front-react/components/SimpleGrid/helpers';

const propInStorage = 'cardType';

const defaultState = Map({
    data: Map(),
    checkedRows: List(),
    checkedRowsChangeId: 0,
    pagination: Map({
        pageSize: 25,
        pageNumber: 1,
        recordsTotal: 0
    }),
    changeId: 0
});

const FINISHED = 'finished';

export const cardTypeGrid = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.FETCH:
            if (action.methodRequestState === FINISHED && action.result) {
                action.result.pagination = action.result.pagination.length > 0 ? Immutable.fromJS(action.result.pagination[0]) : defaultState.get('pagination');
                return state.set('data', Immutable.fromJS(action.result))
                            .set('checkedRows', defaultState.get('checkedRows'))
                            .set('pagination', action.result.pagination);
            }
            return state;
        case actionTypes.CHECK:
            return (action.params.currentState)
                ? state
                  .set('checkedRows', (state.get('checkedRows').filter((row) => { return (row.get('rowNum') !== action.params.row.rowNum); })))
                  .update('checkedRowsChangeId', (v) => (v + 1))
                : state
                    .updateIn(['checkedRows'], (v) => (action.params.cleanup ? List() : v))
                    .updateIn(['checkedRows'], v => (v.push(Immutable.fromJS(action.params.row))))
                    .update('checkedRowsChangeId', (v) => (v + 1));
        case actionTypes.MULTI_CHECK:
            return (action.params)
                ? state
                    .set('checkedRows', List())
                     .update('checkedRowsChangeId', (v) => (v + 1))
                : state
                    .set('checkedRows', state.getIn(['data', 'type']).toList())
                    .update('checkedRowsChangeId', (v) => (v + 1));
        case actionTypes.REFETCH_CARD_TYPES:
            return state.update('changeId', (v) => ++v);
        case actionTypes.UPDATE_PAGINATION:
            return state
                .update('changeId', (v) => (v + 1))
                .set('pagination', action.params);
        case actionTypes.TOGGLE_TYPE_STATUS:
            return state.update('changeId', (v) => (v + 1));
    }
    return state;
};

const defaultStateGridColumnVisibility = Immutable.fromJS({
    changeId: 0,
    fields: [
        {name: 'name', title: 'Type Name'},
        {name: 'description', title: 'Description'},
        {name: 'cardBrandName', title: 'Brand Name'},
        {name: 'ownershipTypeName', title: 'Type Ownership'},
        {name: 'issuerId', title: 'Issuer Type'},
        {name: 'termMonth', title: 'Term in Months'},
        {name: 'generateControlDigit', title: 'Control Digit Validation'},
        {name: 'isActive', title: 'Status'}
    ]});

export const cardTypeGridColumnVisibility = (state = defaultStateGridColumnVisibility, action) => {
    if (action.type === actionTypes.TOGGLE_COLUMN) {
        return state.update('fields', (fields) => {
            return fields.map((f) => {
                if (action.field.name === f.get('name')) {
                    toggleColumnInStorage(propInStorage, action.field.name);
                    return f.set('visible', !action.field.visible);
                }
                return f;
            });
        });
    } else if (action.type === actionTypes.SET_VISIBLE_COLUMNS) {
        let invisibleColumns = getStorageColumns(propInStorage);
        let fieldsWithVisibility = state.get('fields').map((f) => {
            if (invisibleColumns.includes(f.get('name'))) {
                return f.set('visible', false);
            }
            return f;
        });
        return state.set('fields', fieldsWithVisibility);
    }
    return state;
};
