import immutable from 'immutable';
import {actionsList} from './../actions';

const defaultStateImmutable = immutable.fromJS({
    types: []
});

const FINISHED = 'finished';

export function cardManagementDocument(state = defaultStateImmutable, action) {
    switch (action.type) {
        case actionsList.FETCH_CARD:
            if (action.methodRequestState === FINISHED && action.result) {
                let typesToSet = action.result.documents.map((attachment) => {
                    return {
                        key: attachment.documentTypeId,
                        name: attachment.documentTypeId
                    };
                });

                return state.set('types', immutable.fromJS(typesToSet));
            }
            break;
    }

    return state;
}
