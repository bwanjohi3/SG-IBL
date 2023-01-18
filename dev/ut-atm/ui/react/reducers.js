import {fromJS} from 'immutable';
import {actionList} from './actions';
import {atmTerminalGrid, atmTerminalGridColumnVisibility} from './pages/Terminal/reducer';

import {atmDetails} from './containers/ATM/Details/reducer';
import {currencyDropdown} from './components/CurrencyDropdown/reducer';
import {atmTerminalGridPagination} from './components/Pagination/reducer';

const defaultStateConfig = fromJS({});

export default {
    atmTerminalGrid,
    currencyDropdown,
    atmTerminalGridColumnVisibility,
    atmTerminalGridPagination,
    atmConfig: (state = defaultStateConfig, action) => {
        if (actionList.SET_CONFIG === action.type) {
            return fromJS(action.config);
        }
        return state;
    },
    atmDetails
};
