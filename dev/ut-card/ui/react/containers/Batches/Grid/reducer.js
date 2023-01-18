import { Map, List, fromJS } from 'immutable';
import {gridCheckSingleItem, gridAddCheckedItem, gridRemoveCheckedItem} from '../helpers.js';
import * as actionTypes from './actionTypes.js';
import {UPDATE_CLOSE_REFETCH} from '../../../containers/Applications/Popups/actionTypes';
import {getStorageColumns, toggleColumnInStorage} from 'ut-front-react/components/SimpleGrid/helpers';

const propInStorage = 'batch';
const defaultState = Map(
    {
        data: List(),
        dropdownData: Map({
            businessUnits: List(),
            cardProducts: List()
        }),
        changeId: 0,
        refetchData: false,
        checkedBatchItems: Map()
    });

export const batchesGrid = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.FETCH_BUSINESS_UNITS:
            if (action.methodRequestState === 'finished' && action.result) {
                return state
                    .setIn(['dropdownData', 'businessUnits'], fromJS(
                        action.result.allBranches.map(function(branch) {
                            return {
                                key: parseInt(branch.actorId),
                                name: branch.organizationName
                            };
                        })
                    ));
            }
            return state;
        case actionTypes.FETCH_CARD_PRODUCTS:
            if (action.methodRequestState === 'finished' && action.result) {
                return state
                    .setIn(['dropdownData', 'cardProducts'], fromJS(
                        action.result.product.map(function(value) {
                            return {
                                key: parseInt(value.productId),
                                name: value.name
                            };
                        })
                    ));
            }
            return state;
        case actionTypes.FETCH:
            if (action.methodRequestState === 'finished' && action.result) {
                action.result.batch.forEach(function(value) {
                    value.downloads = value.downloads || '0';
                    value.numberOfCards = value.numberOfCards || '0';
                    value.generatedPinMails = value.generatedPinMails || '0';
                });
                return state
                    .update('changeId', (v) => (v + 1))
                    .set('refetchData', false)
                    .set('checkedBatchItems', Map())
                    .set('data', fromJS(action.result).get('batch'));
            }
            return state
                    .set('refetchData', false);
        case actionTypes.DOWNLOAD_FILE:
            return state
                .update('changeId', (v) => (v + 1))
                .updateIn(['checkedBatchItems', action.checkedIdx.toString(), 'downloads'], (v) => (parseInt(v) + 1))
                .updateIn(['data', action.checkedIdx.toString(), 'downloads'], (v) => (parseInt(v) + 1));
        case actionTypes.CHECK:
            if (!action.params.currentState) { // add
                let checkedItems = gridAddCheckedItem(action.params.rowIdx, action.params.row, state.get('checkedBatchItems').toJS());
                return state
                    .set('checkedBatchItems', checkedItems)
                    .update('changeId', (v) => (v + 1));
            } else { // remove
                let checkedItems = gridRemoveCheckedItem(action.params.rowIdx, state.get('checkedBatchItems').toJS());
                return state
                    .set('checkedBatchItems', checkedItems)
                    .update('changeId', (v) => (v + 1));
            }
        case actionTypes.CHECK_SINGLE:
            let checkedItem = gridCheckSingleItem(action.params.row, state.get('data').toJS(), 'id');
            return state
                    .set('checkedBatchItems', checkedItem)
                    .update('changeId', (v) => (v + 1));
        case actionTypes.MULTI_CHECK:
            if (!action.params.currentState) { // add
                return state
                    .set('checkedBatchItems', state.get('data').toMap())
                    .update('changeId', (v) => (v + 1));
            } else { // remove
                return state
                    .set('checkedBatchItems', Map())
                    .update('changeId', (v) => (v + 1));
            }
        case UPDATE_CLOSE_REFETCH:
            if (action.methodRequestState === 'finished' && action.result) {
                return state
                    .set('refetchData', true);
            }
            return state;
        case actionTypes.ARE_ALL_CARDS_GENERATED_UPDATE:
            return state
                .setIn(['checkedBatchItems', action.params.checkedIdx.toString(), 'areAllCardsGenerated'], action.params.value)
                .setIn(['data', action.params.checkedIdx.toString(), 'areAllCardsGenerated'], action.params.value);
        default:
            return state;
    }
};

const defaultStateGridColumnVisibility = fromJS(
    {
        changeId: 0,
        fields: [
            {title: 'Batch Name', name: 'batchName'},
            {title: 'Target Business Unit', name: 'targetBranchName'},
            {title: 'Issuing Business Unit', name: 'issuingBranchName'},
            {title: 'Card Product', name: 'productName'},
            {title: 'Cards in Batch', name: 'numberOfCards'},
            {title: 'Generated PIN Mails', name: 'generatedPinMails'},
            {title: 'Downloads', name: 'downloads'},
            {title: 'Sent to Production on', name: 'batchDateSent'},
            {title: 'Created on', name: 'batchDateCreated'},
            {title: 'Status', name: 'batchStatus'}
        ]
    }
);

export const batchesGridColumnVisibility = (state = defaultStateGridColumnVisibility, action) => {
    if (action.type === actionTypes.TOGGLE_COLUMN) {
        return state
            .update('changeId', (v) => (v + 1))
            .update('fields', function(fields) {
                return fields.map(function(f) {
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
