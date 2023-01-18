import {fromJS, Map} from 'immutable';
import * as actionTypes from './actionTypes.js';
import {actionList} from '../../actions.js';

let appTerminalGridDefProps = fromJS({
    data: [],
    checkedRows: {}
});

export const appTerminalGrid = (state = appTerminalGridDefProps, action) => {
    if (action.methodRequestState === 'finished') {
        if (action.type === actionTypes.FETCH) {
            if (action.result && action.result.apps && action.result.apps.length > 0) {
                return state
                    .set('data', fromJS(action.result.apps))
                    .set('checkedRows', appTerminalGridDefProps.get('checkedRows'));
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
const defaultAppTerminalGridColumnVisibility = fromJS([
    {title: 'ID', name: 'appId'},
    {title: 'Name', name: 'name'},
    {title: 'Version', name: 'version'},
    {title: 'Description', name: 'description'},
    {title: 'Status', name: 'isEnable'}
]);
export const appTerminalGridColumnVisibility = (state = defaultAppTerminalGridColumnVisibility, action) => {
    if (action.type === actionList.SET_CONFIG) {
        return defaultAppTerminalGridColumnVisibility.map((v) => {
            if (action.config.pos.applications.grid.vissibleFields.indexOf(v.get('name')) >= 0) {
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
