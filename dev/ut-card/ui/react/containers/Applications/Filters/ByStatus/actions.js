import * as actionTypes from './actionTypes';

export function updateCardStatus(params) {
    return {
        type: actionTypes.UPDATE_CARD_STATUS,
        params: params
    };
}
