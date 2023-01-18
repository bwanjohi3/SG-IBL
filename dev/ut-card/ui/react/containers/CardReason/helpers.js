import {List} from 'immutable';

export function parseModuleActions(moduleName, actionList) {
    let applicationActions = List(actionList
        .get('Application') || []);
    let batchActions = List(actionList
        .get('Batch') || []);
    let cardActions = List(actionList
        .get('Card') || []);
    let cardInUseActions = List(actionList
        .get('CardInUse') || []);

    let actions = List();
    switch (moduleName) {
        case 'Application':
            actions = applicationActions;
            break;
        case 'Batch':
            actions = batchActions;
            break;
        case 'Card':
            actions = cardActions;
            break;
        case 'CardInUse':
            actions = cardInUseActions;
            break;
        default:
            let allActions = List([...applicationActions, ...batchActions, ...cardActions, ...cardInUseActions]);
            actions = allActions
                .filter((action, pos) => {
                    // filter duplicates
                    return allActions.findIndex((act) => {
                        return act.get('actionId') === action.get('actionId');
                    }) === pos;
                });
            break;
    }

    return actions
        .filter((action) => {
            // special case aciton we don't need appearing in action dropdowns;
            return action.get('actionName') !== 'Allocate';
        }).map((action) => ({
            key: action.get('actionId'),
            name: action.get('itemDescriptionTranslation')
        })).toJS();
};

export function getModules(actionList) {
    let modules = [];

    actionList.get('Application') && actionList.get('Application').size > 0 && modules.push({key: 'Application', name: 'Application'});
    actionList.get('Batch') && actionList.get('Batch').size > 0 && modules.push({key: 'Batch', name: 'Batch'});
    actionList.get('Card') && actionList.get('Card').size > 0 && modules.push({key: 'Card', name: 'Cards in Production'});
    actionList.get('CardInUse') && actionList.get('CardInUse').size > 0 && modules.push({key: 'CardInUse', name: 'Cards in Use'});

    return modules;
};
