import immutable from 'immutable';
import { textValidations } from 'ut-front-react/validator/constants.js';

let i;

// grid helpers
export function gridCheckSingleItem(record, data, checkKey) {
    let result = {};
    for (i = 0; i < data.length; i++) {
        if (data[i][checkKey] === record[checkKey]) {
            result[i] = data[i];
        }
    }
    return immutable.fromJS(result);
};
export function gridAddCheckedItem(rowIdx, record, data) {
    data[rowIdx] = record;
    return immutable.fromJS(data);
};
export function gridRemoveCheckedItem(rowIdx, data) {
    for (let eachKey in data) {
        if (parseInt(eachKey) === rowIdx) {
            delete data[eachKey];
        }
    };
    return immutable.fromJS(data);
};

export function updateError(action, errors) {
    let newErrors = errors;
    if (action.params.error) {
        newErrors = newErrors.set(action.params.key, action.params.errorMessage);
    } else {
        newErrors = newErrors.delete(action.params.key);
    }
    return newErrors;
};

export function getBatchValidationRules() {
    return [
        {type: textValidations.isRequired, errorMessage: 'Batch name is required.'},
        {type: textValidations.length, minVal: 1, maxVal: 30, errorMessage: 'Batch name should be between 1 and 30 symbols long.'}
    ];
};
export function getNumberOfCardsValidationRules() {
    return [
        {type: textValidations.isRequired, errorMessage: 'Number of cards are required.'},
        {type: textValidations.numberOnly, errorMessage: 'Please enter a number.'},
        {type: textValidations.length, minVal: 1, maxVal: 5, errorMessage: 'Number of cards should be between 1 and 99999.'},
        {type: textValidations.regex, value: /^[1-9][0-9]*$/, errorMessage: 'Number of cards are required.'}
    ];
};
