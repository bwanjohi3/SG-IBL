import * as actionTypes from './actionTypes.js';

export const fetch = (filterBy, orderBy, paging) => ({type: actionTypes.FETCH, params: { filterBy, orderBy, paging }, method: 'db/pos.terminal.fetch'});
export const check = (rowIdx, row, currentState) => ({type: actionTypes.CHECK, params: {rowIdx, row, currentState, cleanup: true}});
export const checkMulti = (currentState) => ({type: actionTypes.MULTI_CHECK, params: {currentState}});
export const toggleColumn = (field) => ({type: actionTypes.TOGGLE_COLUMN, field});
export const setVisibleColumns = () => ({type: actionTypes.SET_VISIBLE_COLUMNS});
