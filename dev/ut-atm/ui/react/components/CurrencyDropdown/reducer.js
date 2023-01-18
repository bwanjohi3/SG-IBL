import {Map, List, fromJS} from 'immutable';
import {actionList} from './actions';

const currencyDropdownDefState = Map({data: List(), methodRequestState: ''});
export const currencyDropdown = (state = currencyDropdownDefState, action) => {
    
    if (actionList.FETCH === action.type) {
        if (action.methodRequestState === 'finished') {
            return state
                .set('data', fromJS(action.result.currency.map((v) => ({key: v.currency, name: `${v.currency} ${v.itemDescription}`}))))
                .set('methodRequestState', '');
        } else {
            return state.set('methodRequestState', action.methodRequestState);
        }
    }
    return state;
};
