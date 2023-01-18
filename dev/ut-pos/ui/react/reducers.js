import {fromJS} from 'immutable';
import {actionList} from './actions';
import {posTerminalGrid, posTerminalGridColumnVisibility} from './pages/Terminal/reducer';
import {appTerminalGrid, appTerminalGridColumnVisibility} from './pages/Application/reducer';
import {binListTerminalGrid, binListTerminalGridColumnVisibility} from './pages/BinList/reducer';

import {posDetails} from './containers/POS/Details/reducer';
import {applicationDetails} from './containers/Application/Details/reducer';
import {binListDetails} from './containers/BinList/Details/reducer';
// import {currencyDropdown} from './components/CurrencyDropdown/reducer';
import {posTerminalGridPagination} from './components/Pagination/reducer';

const defaultStateConfig = fromJS({});

export default {
    posTerminalGrid,
    // currencyDropdown,
    posTerminalGridColumnVisibility,
    posTerminalGridPagination,
    appTerminalGrid,
    appTerminalGridColumnVisibility,
    binListTerminalGrid,
    binListTerminalGridColumnVisibility,
    posConfig: (state = defaultStateConfig, action) => {
        if (actionList.SET_CONFIG === action.type) {
            return fromJS(action.config);
        }
        return state;
    },
    posDetails,
    applicationDetails,
    binListDetails
};
