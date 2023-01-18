import {Map, List, fromJS} from 'immutable';
import * as actionTypes from './actionTypes';
import {methodRequestState} from './../../constants';

const defaultState = fromJS({
    isOpen: false,
    changeId: 0,
    dropdownsTotal: 8,
    dropdownsFetched: 0,
    ownershipTypes: List(),
    binTypes: List(),
    binTypesFiltered: List(),
    cardBrands: List(),
    cardNumberConstructionTypes: List(),
    organizations: List(),
    cdol1Profiles: List(),
    cipherList: List(),
    emvTags: List(),
    partnerTypes: List(),
    cardTypeData: {
        typeId: undefined,
        ownershipTypeId: null,
        embossedTypeId: undefined,
        name: null,
        description: null,
        binId: List(),
        cardBrandId: null,
        cardNumberConstructionId: null,
        // branchId: undefined,
        termMonth: undefined,
        cvk: null,
        pvk: null,
        cryptogramMethodIndex: null,
        cryptogramMethodName: '',
        schemeId: null,
        mkac: null,
        ivac: null,
        cdol1ProfileId: null,
        applicationInterchangeProfile: null,
        decimalisation: null,
        cipher: null,
        cvvs: List(),
        serviceCode1: null,
        serviceCode2: null,
        serviceCode3: null,
        generateControlDigit: false,
        issuerId: null,

        emvRequestTags: List(),
        emvResponseTags: List(),

        isActive: true
    },
    errors: Map()
});

const FINISHED = 'finished';

export const createCardType = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.TOGGLE_CREATE_CARD_TYPE_POPUP:
            return state
                .update('isOpen', (value) => (!value));
        case actionTypes.SET_EDIT_MODE:
            return state
                .setIn(['cardTypeData', 'typeId'], action.params.typeId)
                .set('isOpen', true);
        case actionTypes.FETCH_CARD_TYPE_BY_ID:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let ownershipTypeId = parseInt(action.result.typeBin[0].ownershipTypeId);
                let cardType = action.result.type.pop();
                let binId = action.result.typeBin.map((value) => {
                    return {
                        key: value.binId,
                        name: value.binDescription,
                        ownershipTypeId: parseInt(value.ownershipTypeId)
                    };
                });
                let binTypesFiltered = state.get('binTypes').toJS().filter((value) => {
                    return value.ownershipTypeId === ownershipTypeId;
                });
                if (action.result.typeBin[0].ownershipTypeName.includes('own')) {
                    let cvvs = [];
                        if (cardType.cvv1) {
                            cvvs.push({key: 'cvv1', name: 'CVV1'});
                        }
                        if (cardType.cvv2) {
                            cvvs.push({key: 'cvv2', name: 'CVV2'});
                        }
                        if (cardType.icvv) {
                            cvvs.push({key: 'icvv', name: 'iCVV'});
                        }
                        return state
                            .set('binTypesFiltered', fromJS(binTypesFiltered))

                            .setIn(['cardTypeData', 'ownershipTypeId'], ownershipTypeId)
                            .setIn(['cardTypeData', 'name'], cardType.name)
                            .setIn(['cardTypeData', 'description'], cardType.description)
                            .setIn(['cardTypeData', 'binId'], fromJS(binId))

                            .setIn(['cardTypeData', 'cardBrandId'], cardType.cardBrandId)
                            .setIn(['cardTypeData', 'cardNumberConstructionId'], cardType.cardNumberConstructionId)
                            .setIn(['cardTypeData', 'termMonth'], cardType.termMonth)
                            .setIn(['cardTypeData', 'cryptogramMethodIndex'], cardType.cryptogramMethodIndex.toString())
                            .setIn(['cardTypeData', 'cryptogramMethodName'], cardType.cryptogramMethodName)
                            .setIn(['cardTypeData', 'schemeId'], cardType.schemeId)
                            .setIn(['cardTypeData', 'cipher'], cardType.cipher)
                            .setIn(['cardTypeData', 'cvvs'], fromJS(cvvs))
                            .setIn(['cardTypeData', 'serviceCode1'], cardType.serviceCode1.toString())
                            .setIn(['cardTypeData', 'serviceCode2'], cardType.serviceCode2.toString())
                            .setIn(['cardTypeData', 'serviceCode3'], cardType.serviceCode3.toString())
                            .setIn(['cardTypeData', 'generateControlDigit'], cardType.generateControlDigit)
                            .setIn(['cardTypeData', 'issuerId'], cardType.issuerId)
                            .setIn(['cardTypeData', 'cvk'], cardType.cvkExists === 1 ? 'There is an existing value' : null)
                            .setIn(['cardTypeData', 'pvk'], cardType.pvkExists === 1 ? 'There is an existing value' : null)
                            .setIn(['cardTypeData', 'mkac'], cardType.mkacExists === 1 ? 'There is an existing value' : null)
                            .setIn(['cardTypeData', 'ivac'], cardType.ivacExists === 1 ? 'There is an existing value' : null)
                            .setIn(['cardTypeData', 'decimalisation'], cardType.decimalisationExists === 1 ? 'There is an existing value' : null)

                            .setIn(['cardTypeData', 'isActive'], cardType.isActive)
                            .set('dropdownsFetched', defaultState.get('dropdownsFetched'));
                } else if (action.result.typeBin[0].ownershipTypeName.includes('external')) {
                        let emvRequestTagsArray = cardType.emvRequestTags.split(',');
                        let emvRequestTags = state.get('emvTags').filter((value) => {
                            return emvRequestTagsArray.includes(value.get('key'));
                        });
                        let emvResponseTagsArray = cardType.emvResponseTags.split(',');
                        let emvResponseTags = state.get('emvTags').filter((value) => {
                            return emvResponseTagsArray.includes(value.get('key'));
                        });

                        return state
                            .set('binTypesFiltered', fromJS(binTypesFiltered))

                            .setIn(['cardTypeData', 'ownershipTypeId'], ownershipTypeId)
                            .setIn(['cardTypeData', 'name'], cardType.name)
                            .setIn(['cardTypeData', 'description'], cardType.description)
                            .setIn(['cardTypeData', 'binId'], fromJS(binId))
                            .setIn(['cardTypeData', 'emvRequestTags'], emvRequestTags)
                            .setIn(['cardTypeData', 'emvResponseTags'], emvResponseTags)
                            .setIn(['cardTypeData', 'issuerId'], cardType.issuerId)

                            .setIn(['cardTypeData', 'isActive'], cardType.isActive)
                            .set('dropdownsFetched', defaultState.get('dropdownsFetched'));
                }
            }
            return state;
        case actionTypes.FETCH_PARTNER_TYPES:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let partnerTypes = fromJS(action.result.partner.map((type) => {
                    return {
                        key: type.partnerId,
                        name: type.partnerName
                    };
                }));
                return state
                    .set('partnerTypes', partnerTypes)
                    .update('dropdownsFetched', (v) => (v + 1));
            }
            break;
        case actionTypes.FETCH_OWNERSHIP_TYPES:
            if (action.methodRequestState === methodRequestState.FINISHED && action.result) {
                let ownershipTypes = fromJS(action.result.ownershipType.map((type) => {
                    return {
                        key: parseInt(type.ownershipTypeId),
                        name: type.ownershipTypeName
                    };
                }));
                return state
                    .set('ownershipTypes', ownershipTypes)
                    .update('dropdownsFetched', (v) => (v + 1));
            }
            break;
        case actionTypes.FETCH_CARD_BRANDS:
            if (action.methodRequestState === FINISHED && action.result) {
                return state
                    .set('cardBrands', fromJS(action.result.cardBrand))
                    .update('dropdownsFetched', (v) => (v + 1));
            }
            return state;
        case actionTypes.FETCH_CARD_NUMBER_CONSTRUCTION:
            if (action.methodRequestState === FINISHED && action.result) {
                return state
                    .set('cardNumberConstructionTypes', fromJS(action.result.cardNumberConstruction))
                    .update('dropdownsFetched', (v) => (v + 1));
            }
            return state;
        case actionTypes.FETCH_BIN_TYPES:
            if (action.methodRequestState === FINISHED && action.result) {
                action.result.cardBin = action.result.cardBin.map((value) => {
                    return {
                        key: value.binId,
                        // name: value.typeId ? value.description + ' (ALREADY USED)' : value.description,
                        name: value.description,
                        ownershipTypeId: parseInt(value.ownershipTypeId)
                    };
                });
                return state
                    .set('binTypes', fromJS(action.result.cardBin))
                    .update('dropdownsFetched', (v) => (v + 1));
            }
            return state;
        case actionTypes.FETCH_CDOL1_PROFILES:
            if (action.methodRequestState === FINISHED && action.result) {
                return state
                    .set('cdol1Profiles', fromJS(action.result.cdol1Profile))
                    .update('dropdownsFetched', (v) => (v + 1));
            }
            return state;
        // case actionTypes.FETCH_BUSINESS_UNITS:
        //     if (action.methodRequestState === FINISHED && action.result) {
        //         return state.set('organizations', fromJS(action.result.organization));
        //     }
        //     return state;
        case actionTypes.FETCH_CIPHER:
            if (action.methodRequestState === FINISHED && action.result) {
                return state
                    .set('cipherList', fromJS(action.result.ciphers))
                    .update('dropdownsFetched', (v) => (v + 1));
            }
            return state;
        case actionTypes.FETCH_EMV_TAGS:
            if (action.methodRequestState === FINISHED && action.result) {
                return state
                    .set('emvTags', fromJS(action.result.emvTags))
                    .update('dropdownsFetched', (v) => (v + 1));
            }
            return state;
        case actionTypes.UPDATE_SINGLE_VALUE:
            let newState = state;
            switch (action.params.field) {
                case 'ownershipTypeId':
                    let binTypesFiltered = state.get('binTypes').toJS().filter((value) => {
                        return value.ownershipTypeId === action.params.value;
                    });
                    return newState
                        .set('binTypesFiltered', fromJS(binTypesFiltered))
                        .setIn(['cardTypeData', 'binId'], defaultState.getIn(['cardTypeData', 'binId']))
                        .setIn(['cardTypeData', action.params.field], action.params.value);
                case 'cryptogramMethod':
                    return newState
                        .setIn(['cardTypeData', 'cryptogramMethodIndex'], action.params.cryptogramMethodIndex)
                        .setIn(['cardTypeData', 'cryptogramMethodName'], action.params.cryptogramMethodName)
                        .setIn(['cardTypeData', 'schemeId'], action.params.schemeId);
                default:
                    return newState
                        .setIn(['cardTypeData', action.params.field], action.params.value);
            }
        case actionTypes.UPDATE_GENERATE_CONTROL_DIGIT:
            return state
                .updateIn(['cardTypeData', 'generateControlDigit'], (v) => (!v));
        case actionTypes.UPDATE_MULTI_VALUE:
            return state
                .setIn(['cardTypeData', action.params.field], fromJS(action.params.value));
        case actionTypes.SET_ERRORS:
            return state
                .set('errors', fromJS(action.params));
        case actionTypes.CREATE_TYPE:
            if (action.methodRequestState === FINISHED) {
                if (action.result) {
                    return defaultState;
                }
                return state;
            }
            return state;
        case actionTypes.RESET_STATE:
            return defaultState;
        default:
            return state;
    }
    return state;
};
