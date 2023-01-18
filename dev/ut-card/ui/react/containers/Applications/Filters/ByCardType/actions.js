import * as actionTypes from './actionTypes';

export function updateCardType(params) {
    return {
        type: actionTypes.UPDATE_CARD_TYPE,
        params: params
    };
}
