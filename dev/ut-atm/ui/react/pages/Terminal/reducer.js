import {fromJS, Map} from 'immutable';
import * as actionTypes from './actionTypes.js';
import {actionList} from '../../actions.js';

let atmTerminalGridDefProps = fromJS({
    data: [],
    checkedRows: {}
});

export const atmTerminalGrid = (state = atmTerminalGridDefProps, action) => {
    if (action.methodRequestState === 'finished') {
        if (action.type === actionTypes.FETCH) {
            if (action.result && action.result.terminals && action.result.terminals.length > 0) {
                return state
                    .set('data', fromJS(action.result.terminals))
                    .set('checkedRows', atmTerminalGridDefProps.get('checkedRows'));
            }
        }
    } else if (action.type === actionTypes.CHECK) {
        return state
            .update('checkedRows', (v) => (action.params.cleanup ? Map() : v)) // if cleanup is set, remove all checked rows
            .update('checkedRows', (rows) => {
                if (!action.params.currentState) {
                    return rows.set(action.params.rowIdx, fromJS(action.params.row));
                }
                return rows;
            });
    } else if (action.type === actionTypes.MULTI_CHECK) {
        if (action.params.currentState) {
            return state.set('checkedRows', Map());
        } else {
            return state.set('checkedRows', state.get('data').toMap());
        }
    }
    return state;
};
// title is special here, because there can be label as "Name" for instance, we are
// setting the label to ut-atm-atm>terminals>Name so it can be unique.
const defaultAtmTerminalGridColumnVisibility = fromJS([
    {title: 'ID', name: 'atmId'},
    {title: 'Luno', name: 'luno'},
    {title: 'Terminal Master Key', name: 'tmk'},
    {title: 'TMK KCV', name: 'tmkkvv'},
    {title: 'Name', name: 'name'},
    {title: 'Cassette Currency 1', name: 'cassette1Currency'},
    {title: 'Cassette Denomination 1', name: 'cassette1Denomination'},
    {title: 'Cassette Currency 2', name: 'cassette2Currency'},
    {title: 'Cassette Denomination 2', name: 'cassette2Denomination'},
    {title: 'Cassette Currency 3', name: 'cassette3Currency'},
    {title: 'Cassette Denomination 3', name: 'cassette3Denomination'},
    {title: 'Cassette Currency 4', name: 'cassette4Currency'},
    {title: 'Cassette Denomination 4', name: 'cassette4Denomination'},
    {title: 'Terminal ID', name: 'terminalId'},
    {title: 'Institution Code', name: 'institutionCode'},
    {title: 'Identification Code', name: 'identificationCode'},
    {title: 'Menu Profile', name: 'customization'},
    {title: 'Merchant ID', name: 'merchantId'},
    {title: 'Merchant Type', name: 'merchantType'},
    {title: 'Address', name: 'address'},
    {title: 'City', name: 'city'},
    {title: 'Country', name: 'country'},
    {title: 'State', name: 'state'},
    {title: 'Branch', name: 'organizationName'}

    // {title: 'Sensor Door', name: 'sensor.door'},
    // {title: 'Sensor Supervisor Mode', name: 'sensor.supervisorMode'},
    // {title: 'Sensor Vibration', name: 'sensor.vibration'},
    // {title: 'Sensor Silent Signal', name: 'sensor.silentSignal'},
    // {title: 'Sensor Electronics Enclosure', name: 'sensor.electronicsEnclosure'},
    // {title: 'Sensor Deposit Bin', name: 'sensor.depositBin'},
    // {title: 'Sensor Card Bin', name: 'sensor.cardBin'},
    // {title: 'Sensor Reject Bin', name: 'sensor.rejectBin'},
    // {title: 'Sensor Cassette 1', name: 'sensor.cassette1'},
    // {title: 'Sensor Cassette 2', name: 'sensor.cassette2'},
    // {title: 'Sensor Cassette 3', name: 'sensor.cassette3'},
    // {title: 'Sensor Cassette 4', name: 'sensor.cassette4'},
    // {title: 'Sensor Coin Dispenser', name: 'sensor.coinDispenser'},
    // {title: 'Sensor CoinHopper 1', name: 'sensor.coinHopper1'},
    // {title: 'Sensor CoinHopper 2', name: 'sensor.coinHopper2'},
    // {title: 'Sensor CoinHopper 3', name: 'sensor.coinHopper3'},
    // {title: 'Sensor CoinHopper 4', name: 'sensor.coinHopper4'},
    // {title: 'Sensor Cpm Pockets', name: 'sensor.cpmPockets'},

    // {title: 'Fitness Clock', name: 'fitness.clock'},
    // {title: 'Fitness Comms', name: 'fitness.comms'},
    // {title: 'Fitness Disk', name: 'fitness.disk'},
    // {title: 'Fitness Card Reader', name: 'fitness.cardReader'},
    // {title: 'Fitness Cash Handler', name: 'fitness.cashHandler'},
    // {title: 'Fitness Depository', name: 'fitness.depository'},
    // {title: 'Fitness Receipt Printer', name: 'fitness.receiptPrinter'},
    // {title: 'Fitness Night Depository', name: 'fitness.nightDepository'},
    // {title: 'Fitness Encryptor', name: 'fitness.encryptor'},
    // {title: 'Fitness Camera', name: 'fitness.camera'},
    // {title: 'Fitness Door Access', name: 'fitness.doorAccess'},
    // {title: 'Fitness Flex Disk', name: 'fitness.flexDisk'},
    // {title: 'Fitness Cassette 1', name: 'fitness.cassette1'},
    // {title: 'Fitness Cassette 2', name: 'fitness.cassette2'},
    // {title: 'Fitness Cassette 3', name: 'fitness.cassette3'},
    // {title: 'Fitness Cassette 4', name: 'fitness.cassette4'},
    // {title: 'Fitness Statement Printer', name: 'fitness.statementPrinter'},
    // {title: 'Fitness Signage Display', name: 'fitness.signageDisplay'},
    // {title: 'Fitness System Display', name: 'fitness.systemDisplay'},
    // {title: 'Fitness Media Entry', name: 'fitness.mediaEntry'},
    // {title: 'Fitness Envelope Dispenser', name: 'fitness.envelopeDispenser'},
    // {title: 'Fitness Document Processing', name: 'fitness.documentProcessing'},
    // {title: 'Fitness Coin Dispenser', name: 'fitness.coinDispenser'},
    // {title: 'Fitness Voice Guidance', name: 'fitness.voiceGuidance'},
    // {title: 'Fitness Note Acceptor', name: 'fitness.noteAcceptor'},
    // {title: 'Fitness Cheque Processor', name: 'fitness.chequeProcessor'},

    // {title: 'Supply Card Reader', name: 'supply.cardReader'},
    // {title: 'Supply Depository', name: 'supply.depository'},
    // {title: 'Supply Receipt Printer', name: 'supply.receiptPrinter'},
    // {title: 'Supply Journal Printer', name: 'supply.journalPrinter'},
    // {title: 'Supply Reject Bin', name: 'supply.rejectBin'},
    // {title: 'Supply Cassette 1', name: 'supply.cassette1'},
    // {title: 'Supply Cassette 2', name: 'supply.cassette2'},
    // {title: 'Supply Cassette 3', name: 'supply.cassette3'},
    // {title: 'Supply Cassette 4', name: 'supply.cassette4'},

    // {title: 'Counter Notes 1', name: 'counter.notes1'},
    // {title: 'Counter Notes 2', name: 'counter.notes2'},
    // {title: 'Counter Notes 3', name: 'counter.notes3'},
    // {title: 'Counter Notes 4', name: 'counter.notes4'},
    // {title: 'Counter Rejected 1', name: 'counter.rejected1'},
    // {title: 'Counter Rejected 2', name: 'counter.rejected2'},
    // {title: 'Counter Rejected 3', name: 'counter.rejected3'},
    // {title: 'Counter Rejected 4', name: 'counter.rejected4'},
    // {title: 'Counter Dispensed 1', name: 'counter.dispensed1'},
    // {title: 'Counter Dispensed 2', name: 'counter.dispensed2'},
    // {title: 'Counter Dispensed 3', name: 'counter.dispensed3'},
    // {title: 'Counter Dispensed 4', name: 'counter.dispensed4'},
    // {title: 'Counter Last 1', name: 'counter.last1'},
    // {title: 'Counter Last 2', name: 'counter.last2'},
    // {title: 'Counter Last 3', name: 'counter.last3'},
    // {title: 'Counter Last 4', name: 'counter.last4'},
    // {title: 'Counter Captured', name: 'counter.captured'},
    // {title: 'Counter Transaction Count', name: 'counter.transactionCount'},
    // {title: 'Counter Transaction Serial Number', name: 'counter.transactionSerialNumber'}
]);
export const atmTerminalGridColumnVisibility = (state = defaultAtmTerminalGridColumnVisibility, action) => {
    if (action.type === actionList.SET_CONFIG) {
        return defaultAtmTerminalGridColumnVisibility.map((v) => {
            if (action.config.atm.terminals.grid.vissibleFields.indexOf(v.get('name')) >= 0) {
                return v.set('visible', true);
            }
            return v.set('visible', false);
        });
        //
    } else if (action.type === actionTypes.TOGGLE_COLUMN) {
        return state.map((column) => {
            if (action.field.name === column.get('name')) {
                return column.update('visible', true, (visible) => {
                    return !visible;
                });
            }
            return column;
        });
    }
    return state;
};
