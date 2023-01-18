import { actionList } from './actions';
import { actionsList as detailsActions } from '../ActionDialogScreens/Details/actions';
import immutable, {fromJS, List} from 'immutable';
import {getStorageColumns, toggleColumnInStorage} from 'ut-front-react/components/SimpleGrid/helpers';

const propInStorage = 'card';

const FINISHED = 'finished'; // from methodRequestState
const REQUESTED = 'requested'; // from methodRequestState

const defaultCardsState = {
    data: [],
    checked: [],
    selected: [],
    isGridLoading: false,
    checkedRowsChangeId: 0
};

const defaultStateImmutable = immutable.fromJS(defaultCardsState);

export function cardManagementGrid(state = defaultStateImmutable, action) {
    switch (action.type) {
        case actionList.FETCH_CARDS:
            if (action.methodRequestState === REQUESTED) {
                return state.set('isGridLoading', true);
            } else if (action.methodRequestState === FINISHED && action.result) {
                return state
                    .set('checked', defaultStateImmutable.get('checked'))
                    .set('selected', defaultStateImmutable.get('selected'))
                    .set('data', fromJS(action.result.cards))
                    .set('isGridLoading', false);
            } else if (action.methodRequestState === FINISHED && action.error) {
                return state
                    .set('isGridLoading', false);
            }
            break;
        case actionList.CHECK_CARD:
            let newChecked = state.get('checked');
            let current = fromJS(action.card);

            if (!action.checked) {
                newChecked = newChecked.push(current);
            } else {
                newChecked = newChecked.filter(card => {
                    return !card.equals(current);
                });
            }
            return state
                    .set('checked', newChecked)
                    .update('checkedRowsChangeId', (v) => (v + 1));
        case actionList.CHECK_ALL:
            let checkedRows = state.get('checked');
            if (!action.checked) {
                checkedRows = fromJS(action.cards);
            } else {
                checkedRows = List([]);
            }
            return state
                .set('checked', checkedRows)
                .update('checkedRowsChangeId', (v) => (v + 1));
        case actionList.CLEAR_AND_CHECK:
            if (action.card) {
                let newChecked = immutable.fromJS([action.card]);
                return state
                        .set('checked', newChecked)
                        .update('checkedRowsChangeId', (v) => (v + 1));
            }
            break;
        case actionList.SELECT_CARD:
            if (action.card) {
                state = state
                        .setIn(['selected', 0], fromJS(action.card))
                        .update('checkedRowsChangeId', (v) => (v + 1));
            }
            return state;
        case actionList.CLEAR_SELECTED:
            return state
                .set('selected', defaultStateImmutable.get('selected'));
        case detailsActions.FETCH_CARD:
            // clear selected if the request fails to prevent unexpected behaviour
            if (action.methodRequestState === FINISHED && action.error) {
                return state
                    .set('selected', defaultStateImmutable.get('selected'));
            }
            break;
        default:
            return state;
    }
    return state;
}

export default { cardManagementGrid };

const defaultStateGridColumnVisibility = fromJS({
    changeId: 0,
    fields: [
        {title: 'Card Number', name: 'cardNumber'},
        {title: 'Card Product', name: 'productName'},
        {title: 'Current Business Unit', name: 'currentBranchName'},
        {title: 'Target Business Unit', name: 'targetBranchName'},
        {title: 'Issuing Business Unit', name: 'issuingBranchName'},
        {title: 'Acceptance date', name: 'acceptanceDate'},
        {title: 'Expiry Date', name: 'expirationDate'},
        {title: 'Generated PIN Mails', name: 'generatedPinMails'},
        {title: 'Batch Name', name: 'batchName'},
        {title: 'Status', name: 'statusName'}
    ]
});

export const cardInProductionGridColumnVisibility = (state = defaultStateGridColumnVisibility, action) => {
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
