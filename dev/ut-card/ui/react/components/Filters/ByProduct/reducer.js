import {fromJS} from 'immutable';
import {actionList} from './actions';

export function parseProducts(products) {
    let parsed = products.map((product) => ({
        key: product.productId,
        name: product.name
    }));

    return fromJS(parsed);
};

const defaultState = {
    changeId: 0,
    data: []
};

const defaultStateImmutable = fromJS(defaultState);

const FINISHED = 'finished';

export function cardFilterByCardProduct(state = defaultStateImmutable, action) {
    switch (action.type) {
        case actionList.FETCH_CARD_PRODUCTS:
            if (action.result && action.methodRequestState === FINISHED) {
                return state
                    .set('data', parseProducts(action.result.product));
            }
            break;
    }

    return state;
};
