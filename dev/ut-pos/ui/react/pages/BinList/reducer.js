import {fromJS, Map} from 'immutable';
import * as actionTypes from './actionTypes.js';
import {actionList} from '../../actions.js';

let binListTerminalGridDefProps = fromJS({
    data: [],
    checkedRows: {}
});

export const binListTerminalGrid = (state = binListTerminalGridDefProps, action) => {
    if (action.methodRequestState === 'finished') {
        if (action.type === actionTypes.FETCH) {
            if (action.result && action.result.binList && action.result.binList.length > 0) {
                let binList = action.result.binList.map(b => {
                    b.transaction = JSON.parse(b.transaction).map(({name}) => name).join(',');
                    return b;
                })
                return state
                    .set('data', fromJS(binList))
                    .set('checkedRows', binListTerminalGridDefProps.get('checkedRows'));
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
const defaultBinListTerminalGridColumnVisibility = fromJS([
    {title: 'ID', name: 'binListId'},
    {title: 'Transaction', name: 'transaction'},
    {title: 'Bin', name: 'description'},
    {title: 'Start Bin', name: 'startBin'},
    {title: 'End Bin', name: 'endBin'},
    {title: 'Card Product', name: 'productName'}
]);
export const binListTerminalGridColumnVisibility = (state = defaultBinListTerminalGridColumnVisibility, action) => {
    if (action.type === actionList.SET_CONFIG) {
        return defaultBinListTerminalGridColumnVisibility.map((v) => {
            if (action.config.pos.binList.grid.vissibleFields.indexOf(v.get('name')) >= 0) {
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
