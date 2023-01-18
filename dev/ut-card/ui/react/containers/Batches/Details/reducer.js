import {Map, List, fromJS} from 'immutable';
import {actionList} from './actions';
import {updateError} from './../helpers';
import {methodRequestState} from './../../constants';

const defaultState = Map({
    opened: false,
    embossedTypeId: 0,
    changeId: 0,
    refetchOnClose: false,
    areAllCardsGenerated: false,

    excludeButtons: false,
    batchData: List(),
    types: List(),

    editableValues: Map({
        // batchName: '',
        // cardCount: '',
        // issuingBusinessUnit: 0,
        // targetBusinessUnit: 0,
        // typeId: 0
    }),
    saveableValues: Map({
        // batchId: 0,
        // statusId: 0,
        // branchId: 0
    }),
    cardsAutoAllocationBusinessUnit: null,
    errors: Map()
});

export const batchDetails = (state = defaultState, action) => {
    switch (action.type) {
        case actionList.FETCH_CARD_TYPES:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let types = action.result.type.map(function(type) {
                    return {key: type.typeId, name: type.name};
                });
                return state.set('types', fromJS(types));
            }
            return state;
        // business unit actions
        case actionList.SET_TARGET_BUSINESS_UNIT:
            return state
                .setIn(['editableValues', 'targetBusinessUnit'], action.params.businessUnitId);
        case actionList.SET_ISSUING_BUSINESS_UNIT:
            return state
                .setIn(['editableValues', 'issuingBusinessUnit'], action.params.businessUnitId);
        // card type actions
        case actionList.SET_CARD_TYPE:
            return state
                .setIn(['editableValues', 'typeId'], action.params.typeId);
        // input fields actions
        case actionList.SET_BATCH_NAME:
            let newBatchErrors = updateError(action, state.get('errors'));
            return state
                .setIn(['editableValues', 'batchName'], action.params.value)
                .set('errors', newBatchErrors);
        case actionList.SET_NUMBER_OF_CARDS:
            let newCardErrors = updateError(action, state.get('errors'));
            return state
                .setIn(['editableValues', 'numberOfCards'], action.params.value)
                .set('errors', newCardErrors);

        case actionList.OPEN:
            if (action.methodRequestState === 'finished' && action.result) {
                let batchResult = ((action.result.batch instanceof Array) ? action.result.batch.pop() : {});
                return state
                    .set('opened', true)
                    .set('embossedTypeId', batchResult.embossedTypeId)
                    .set('areAllCardsGenerated', batchResult.areAllCardsGenerated)
                    .setIn(['saveableValues', 'batchId'], action.params.batchId || 0)
                    .setIn(['saveableValues', 'branchId'], parseInt(batchResult.branchId))
                    .setIn(['saveableValues', 'statusId'], batchResult.statusId)
                    .set('batchData', fromJS((batchResult.batchId ? [batchResult] : [])))
                    .setIn(['editableValues', 'targetBusinessUnit'], parseInt(batchResult.targetBranchId))
                    .setIn(['editableValues', 'issuingBusinessUnit'], parseInt(batchResult.issuingBranchId))
                    .setIn(['editableValues', 'typeId'], batchResult.typeId)
                    .setIn(['editableValues', 'batchName'], batchResult.batchName)
                    .setIn(['editableValues', 'numberOfCards'], batchResult.numberOfCards.toString())
                    .set('excludeButtons', false)
                    .set('errors', Map());
            }
            return state;
        case actionList.DOWNLOAD:
            return state
                .set('refetchOnClose', true);
        case actionList.ARE_ALL_CARDS_GENERATED_UPDATE:
            return state
                .set('areAllCardsGenerated', action.params.value);
        case actionList.CLOSE:
            return state
                .set('opened', false)
                .update('changeId', (v) => (v + (state.get('refetchOnClose') === true ? 1 : 0)))
                .set('refetchOnClose', defaultState.get('refetchOnClose'))
                .set('embossedTypeId', defaultState.get('embossedTypeId'))
                .set('areAllCardsGenerated', defaultState.get('areAllCardsGenerated'))
                .set('saveableValues', defaultState.get('saveableValues'))
                .set('batchData', defaultState.get('batchData'))
                .set('editableValues', defaultState.get('editableValues'))
                .set('excludeButtons', defaultState.get('excludeButtons'))
                .set('errors', defaultState.get('errors'))
                .set('cardsAutoAllocationBusinessUnit', defaultState.get('cardsAutoAllocationBusinessUnit'));
        case actionList.SET_EXCLUDE_BUTTONS:
            return state
                .set('excludeButtons', action.params.actionVisibility);
        case actionList.SET_ERRORS:
            return state
                .set('excludeButtons', true)
                .mergeDeepIn(['errors'], action.params.form);
        case actionList.SET_CARDS_AUTO_ALLOCATION_BUSINESS_UNIT:
            return state
                .set('cardsAutoAllocationBusinessUnit', action.params.value);
        default:
            break;
    }
    return state;
};
