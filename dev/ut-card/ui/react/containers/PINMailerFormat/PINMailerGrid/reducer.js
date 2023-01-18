import { fromJS, Map } from 'immutable';
import * as actionTypes from './actionTypes.js';

const defaultState = fromJS({
    fieldSelectorOpened: false,
    allowSelectPlaceholder: false,
    confirmationDialogOpened: false,
    confirmationDialogTitle: '',
    confirmationDialogMessage: '',
    confirmationDialogActionName: '',
    mailerProperties: {
        pinMailerWidth: '5.0',
        pinMailerHeight: '4.0'
    },
    prevSelectedValueLength: 0,
    selectedCell: {
        rowIndex: null,
        colIndex: null,
        fieldSelectorSelectedValue: null,
        fieldSelectorSelectedValueLength: null
    },
    data: [
        { key: '0', name: 'CUSTOMER NAME' },
        { key: '1', name: 'CARDHOLDER NAME' },
        { key: '2', name: 'PERSON NAME' },
        { key: '3', name: 'CARD NUMBER' },
        { key: '4', name: 'ACCOUNT NUMBER' },
        { key: '5', name: 'PHONE NUMBER' },
        { key: '6', name: 'ADDRESS 1' },
        { key: '7', name: 'ADDRESS 2' },
        { key: 'P', name: 'PIN' },
        { key: 'R', name: 'REFERENCE NUMBER' }
    ],
    gridFields: [],
    spanFields: [],
    verticalFields: [],
    verticalSpanFields: [],
    gridData: [],
    selectedData: [],
    continuousPaper: false,
    printFormatString: '>L>L>L>L>L>L>L>L>L>L>L>L>L>L>L>L>L>L>L>L>L>L>L>L>F',
    printFormatStringFromDb: false,
    pinMailerMaxFieldIndex: '0',
    changeId: 0,
    errors: Map()
});

export const pinMailerGrid = (state = defaultState, action) => {
    switch (action.type) {
        case actionTypes.OPEN_FIELD_SELECTOR:
            return state
                .set('selectedCell', fromJS(action.params.selectedCell))
                .set('allowSelectPlaceholder', action.params.allowSelectPlaceholder)
                .set('prevSelectedValueLength', action.params.prevSelectedValueLength)
                .set('fieldSelectorOpened', true);
        case actionTypes.CLOSE_FIELD_SELECTOR:
            return state
                .set('selectedCell', defaultState.get('selectedCell'))
                .setIn(['errors', 'selectField'], undefined)
                .set('fieldSelectorOpened', false);
        case actionTypes.FIELD_SELECTOR_SELECTION_CHANGE:
            let fieldSelectorSelectedValueLength;
            if (action.value.value === '__placeholder__') {
                fieldSelectorSelectedValueLength = null;
            } else {
                fieldSelectorSelectedValueLength = state.get('data').toJS().filter((popupRow) => {
                    return popupRow.key === action.value.value;
                }).pop().name.length + 1; // +1 for initial '#'
            }
            return state
                .setIn(['selectedCell', 'fieldSelectorSelectedValue'], action.value.value)
                .setIn(['selectedCell', 'fieldSelectorSelectedValueLength'], fieldSelectorSelectedValueLength);
        case actionTypes.SET_GRID_FIELDS:
            return state
                .set('gridFields', fromJS(action.gridFields))
                .set('spanFields', fromJS(action.spanFields))
                .setIn(['mailerProperties', 'pinMailerWidth'], action.pinMailerWidth)
                .update('changeId', (v) => (v + 1));
        case actionTypes.SET_GRID_DATA:
            return state
                .set('gridData', fromJS(action.gridData))
                .setIn(['mailerProperties', 'pinMailerHeight'], action.pinMailerHeight || state.getIn(['mailerProperties', 'pinMailerHeight']))
                .update('changeId', (v) => (v + 1));
        case actionTypes.SET_SELECTED_DATA:
            return state
                .set('selectedData', fromJS(action.selectedData))
                .set('selectedCell', defaultState.get('selectedCell'));
        case actionTypes.SET_DATA_FIELD:
            return state
                .update('changeId', (v) => (v + 1))
                .set('fieldSelectorOpened', false);

        case actionTypes.HANDLE_CONTINUOUS_PAPER_CLICK:
            return state
                .update('continuousPaper', (v) => (!v))
                .update('changeId', (v) => (v + 1));
        case actionTypes.SET_CONTINUOUS_PAPER_VALUE:
            return state
                .set('continuousPaper', action.value);
        case actionTypes.SET_PRINT_FORMAT_STRING:
            return state
                .set('printFormatString', action.params.printFormatString)
                .set('pinMailerMaxFieldIndex', action.params.pinMailerMaxFieldIndex)
                .update('changeId', (v) => (v + 1));
        case actionTypes.SET_PRINT_FORMAT_STRING_FROM_DB:
            return state
                .set('printFormatStringFromDb', action.value);
        case actionTypes.SET_VERTICAL_DATA:
            return state
                .set('verticalFields', fromJS(action.params.verticalFields))
                .set('verticalSpanFields', fromJS(action.params.verticalSpanFields));
        case actionTypes.FETCH:
            if (action.methodRequestState === 'finished' && action.result) {
                if (action.result.userConfiguration && action.result.userConfiguration.length > 0) {
                    let dbSettings = {};
                    action.result.userConfiguration.forEach((value) => {
                        dbSettings[value.key] = value.value;
                    });
                    let settings = {
                        pinMailerFormatString: dbSettings.pinMailerFormatString || defaultState.get('pinMailerFormatString'),
                        pinMailerWidth: dbSettings.pinMailerWidth || defaultState.getIn(['mailerProperties', 'pinMailerWidth']),
                        pinMailerHeight: dbSettings.pinMailerHeight || defaultState.getIn(['mailerProperties', 'pinMailerHeight']),
                        pinMailerMaxFieldIndex: dbSettings.pinMailerMaxFieldIndex || defaultState.get('pinMailerMaxFieldIndex')
                    };
                    return state
                        .set('printFormatString', settings.pinMailerFormatString)
                        .setIn(['mailerProperties', 'pinMailerWidth'], settings.pinMailerWidth)
                        .setIn(['mailerProperties', 'pinMailerHeight'], settings.pinMailerHeight)
                        .set('pinMailerMaxFieldIndex', settings.pinMailerMaxFieldIndex)
                        .set('printFormatStringFromDb', true)
                        .update('changeId', (v) => (v + 1));
                }
                return state
                    .set('printFormatString', defaultState.get('printFormatString'))
                    .setIn(['mailerProperties', 'pinMailerWidth'], defaultState.getIn(['mailerProperties', 'pinMailerWidth']))
                    .setIn(['mailerProperties', 'pinMailerHeight'], defaultState.getIn(['mailerProperties', 'pinMailerHeight']))
                    .set('pinMailerMaxFieldIndex', defaultState.get('pinMailerMaxFieldIndex'))
                    .set('printFormatStringFromDb', true)
                    .update('changeId', (v) => (v + 1));
            }
            // state.data (possible print field options) - OPTIONAL ?!?
            return state
                .set('printFormatString', '');
        case actionTypes.SET_MAILER_WIDTH:
            return state
                .setIn(['mailerProperties', 'pinMailerWidth'], action.pinMailerWidth)
                .update('changeId', (v) => (v + 1));
        case actionTypes.SET_MAILER_HEIGHT:
            return state
                .setIn(['mailerProperties', 'pinMailerHeight'], action.pinMailerHeight)
                .update('changeId', (v) => (v + 1));
        case actionTypes.SET_ERRORS:
            return state
                .mergeDeepIn(['errors'], fromJS(action.errors));

        case actionTypes.OPEN_CONFIRMATION_DIALOG:
            return state
                .set('confirmationDialogOpened', true)
                .set('confirmationDialogTitle', action.params.confirmationDialogTitle)
                .set('confirmationDialogMessage', action.params.confirmationDialogMessage)
                .set('confirmationDialogActionName', action.params.confirmationDialogActionName);
        case actionTypes.CLOSE_CONFIRMATION_DIALOG:
            return state
                .set('confirmationDialogOpened', false);
        default:
            return state;
    }
};
