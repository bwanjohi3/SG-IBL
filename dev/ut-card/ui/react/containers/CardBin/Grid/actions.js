import * as actionTypes from './actionTypes';

export function fetchBins(filterBy = {}, orderBy = [], paging = {}) {
    return {
        type: actionTypes.FETCH_BINS,
        method: 'card.bin.fetch',
        params: {
            filterBy,
            orderBy,
            paging
        }
    };
}
// export function setVisibleColumns() {
//     return {
//         type: actionTypes.SET_VISIBLE_COLUMNS
//     };
// }

// export function toggleVisibleColumn(field) {
//     return {
//         type: actionTypes.TOGGLE_VISIBLE_COLUMN,
//         field
//     };
// };

export function checkBin(rowIdx, row, state) {
    return {
        type: actionTypes.CHECK_BIN,
        params: {
            rowIdx,
            row,
            state
        }
    };
}

export const cleanAndCheck = (rowIdx, row, state) => ({
    type: actionTypes.CHECK_BIN,
    params: {
        rowIdx,
        row,
        state,
        cleanup: true
    }
});

export const multiCheck = (currentState) => ({
    type: actionTypes.MULTI_CHECK,
    params: {currentState}
});
