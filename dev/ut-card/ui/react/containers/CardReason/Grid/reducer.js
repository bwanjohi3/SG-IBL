import { actionList } from './actions';
import { fromJS, List } from 'immutable';
import {getStorageColumns, toggleColumnInStorage} from 'ut-front-react/components/SimpleGrid/helpers';

const propInStorage = 'cardReason';

const FINISHED = 'finished'; // from methodRequestState
const REQUESTED = 'requested'; // from methodRequestState

const defaultReasonGridState = {
    data: [],
    checked: [],
    selected: [],
    isGridLoading: false,
    checkedRowsChangeId: 0
};

const defaultStateImmutable = fromJS(defaultReasonGridState);

export function cardReasonGrid(state = defaultStateImmutable, action) {
    switch (action.type) {
        case actionList.FETCH:
            if (action.methodRequestState === REQUESTED) {
                return state.set('isGridLoading', true);
            }
            if (action.methodRequestState === FINISHED && action.result) {
                return state
                    .set('checked', defaultStateImmutable.get('checked'))
                    .set('selected', defaultStateImmutable.get('selected'))
                    .set('data', fromJS(action.result.cardReason))
                    .set('isGridLoading', false);
            } else if (action.methodRequestState === FINISHED && action.error) {
                return state
                    .set('isGridLoading', false);
            }
            break;
        case actionList.CHECK:
            let newChecked = state.get('checked');
            let current = fromJS(action.reason);
            if (!action.checked) {
                newChecked = newChecked.push(current);
            } else {
                newChecked = newChecked.filter(reason => {
                    return !reason.equals(current);
                });
            }
            return state
                    .set('checked', newChecked)
                    .update('checkedRowsChangeId', (v) => (v + 1));
        case actionList.CHECK_ALL:
            let checkedRows = List([]);
            if (!action.checked) {
                checkedRows = fromJS(action.reasons);
            }
            return state
                    .set('checked', checkedRows)
                    .update('checkedRowsChangeId', (v) => (v + 1));
        case actionList.CLEAR_AND_CHECK:
            if (action.reason) {
                let newChecked = fromJS([action.reason]);
                return state
                        .set('checked', newChecked)
                        .update('checkedRowsChangeId', (v) => (v + 1));
            }
            break;
        case actionList.SELECT:
            if (action.reason) {
                state = state
                        .setIn(['selected', 0], fromJS(action.reason))
                        .update('checkedRowsChangeId', (v) => (v + 1));
            }
            return state;
        case actionList.CLEAR_SELECTED: {
            return state
                .set('selected', defaultStateImmutable.get('selected'));
        }
        default:
            return state;
    }
    return state;
}

const defaultStateGridColumnVisibility = fromJS({
    changeId: 0,
    fields: [
        {title: 'Reason', name: 'reasonName', style: {width: '20%'}},
        {title: 'Module', name: 'module', style: {width: '10%'}},
        {title: 'Actions', name: 'actionName'},
        {title: 'Status', name: 'isActive', style: {width: '10%'}}
    ]});

export const cardReasonGridColumnVisibility = (state = defaultStateGridColumnVisibility, action) => {
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
