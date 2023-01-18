import {Map, List, fromJS} from 'immutable';
import {actionList} from './actions';
import {getStorageColumns, toggleColumnInStorage} from 'ut-front-react/components/SimpleGrid/helpers';

const defaultStateCardInUseGrid = Map({list: List(), checkedRows: Map(), checkedRowsChangeId: 0, isGridLoading: false});

const propInStorage = 'cardInUse';

export const cardInUseGrid = (state = defaultStateCardInUseGrid, action) => {
    if (action.methodRequestState === 'finished' && action.result) {
        if (action.type === actionList.FETCH) {
            return state
                .set('checkedRows', Map())
                .set('list', fromJS(action.result.cards))
                .set('isGridLoading', false);
        }
    } else if (action.methodRequestState === 'finished' && action.error) {
        return state
            .set('isGridLoading', false);
    } else {
        if (action.type === actionList.FETCH) {
            return state
                .set('isGridLoading', true);
        }
        if (action.type === actionList.CLEANUP_CHECKED) {
            return state
                .update('checkedRows', (v) => (Map()))
                .update('checkedRowsChangeId', (v) => (v + 1));
        }
        if (action.type === actionList.CHECK) {
            if (!action.params.state) { // add
                return state
                    .update('checkedRows', (v) => (action.params.cleanup ? Map() : v)) // if cleanup is set, remove all checked rows
                    .setIn(['checkedRows', action.params.rowIdx], Map(action.params.row))
                    .update('checkedRowsChangeId', (v) => (v + 1));
            } else { // remove
                return state
                    .deleteIn(['checkedRows', action.params.rowIdx])
                    .update('checkedRowsChangeId', (v) => (v + 1));
            }
        } else if (action.type === actionList.MULTI_CHECK) {
            if (action.params.currentState) {
                return state
                    .set('checkedRows', Map())
                    .update('checkedRowsChangeId', (v) => (v + 1));
            } else {
                return state
                    .set('checkedRows', state.get('list').toMap())
                    .update('checkedRowsChangeId', (v) => (v + 1));
            }
        }
    }

    return state;
};

const defaultStateCardInUseGridColumnVisibility = fromJS({
    changeId: 0,
    fields: [
        {name: 'cardNumber', title: 'Card Number'},
        {name: 'personName', title: 'Person Name'},
        {name: 'customerName', title: 'Customer Name'},
        {name: 'productName', title: 'Card Product'},
        {name: 'currentBranchName', title: 'Current Business Unit'},
        {name: 'issuingBranchName', title: 'Issuing Business Unit'},
        {name: 'generatedPinMails', title: 'Generated PIN Mails'},
        {name: 'activationDate', title: 'Activation Date'},
        {name: 'temporaryLockEndDate', title: 'Lock End Date'},
        {name: 'expirationDate', title: 'Expiry Date'},
        {name: 'statusName', title: 'Status'}
    ]});

export const cardInUseGridColumnVisibility = (state = defaultStateCardInUseGridColumnVisibility, action) => {
    if (action.type === actionList.TOGGLE_COLUMN) {
        return state.update('fields', (fields) => {
            return fields.map((f) => {
                if (action.field.name === f.get('name')) {
                    toggleColumnInStorage(propInStorage, action.field.name);
                    return f.set('visible', !action.field.visible);
                }
                return f;
            });
        });
    } else if (action.type === actionList.SET_VISIBLE_COLUMNS) {
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
