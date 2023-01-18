import { parseFilters } from './helpers';

export const actionList = {
    'FETCH_CARDS': Symbol('FETCH_CARDS'),
    'CHECK_CARD': Symbol('CHECK_CARD'),
    'CHECK_ALL': Symbol('CHECK_ALL'),
    'CLEAR_AND_CHECK': Symbol('CLEAR_AND_CHECK'),
    'SELECT_CARD': Symbol('SELECT_CARD'),
    'CLEAR_SELECTED': Symbol('CLEAR_SELECTED'),
    'TOGGLE_COLUMN': Symbol('TOGGLE_COLUMN'),
    'SET_VISIBLE_COLUMNS': Symbol('SET_VISIBLE_COLUMNS')
};

export function fetchCards(params) {
    return {
        type: actionList.FETCH_CARDS,
        method: 'card.cardInProduction.fetch',
        params: parseFilters(params)
    };
};
export function checkCard(checked, card) {
    return {
        type: actionList.CHECK_CARD,
        card: card,
        checked: checked
    };
};
export function checkAll(checked, cards) {
    return {
        type: actionList.CHECK_ALL,
        cards: cards,
        checked: checked
    };
}
export function clearAndCheck(card) {
    return {
        type: actionList.CLEAR_AND_CHECK,
        card: card
    };
};
export function selectCard(card) {
    return {
        type: actionList.SELECT_CARD,
        card: card
    };
};
export function clearSelected() {
    return {
        type: actionList.CLEAR_SELECTED
    };
};
export const toggleColumn = (field) => ({type: actionList.TOGGLE_COLUMN, field});
export const setVisibleColumns = () => ({type: actionList.SET_VISIBLE_COLUMNS});
