import { validationTypes, textValidations, dropdownValidations, arrayValidations } from 'ut-front-react/validator/constants.js';

export function getCreateBatchValidator() {
    return [
        {
            key: ['batchName'],
            type: validationTypes.text,
            rules: getBatchNameValidationRules()
        },
        {
            key: ['targetBranchId'],
            type: validationTypes.dropdown,
            rules: [
                {type: dropdownValidations.isRequired, errorMessage: 'Please select business unit.'}
            ]
        },
        {
            key: ['checked'],
            type: validationTypes.array,
            rules: [
                {type: arrayValidations.isRequired, errorMessage: 'Please check at least one application.'}
            ]
        }
    ];
}

export function getBatchNameValidationRules() {
    return [
        {type: textValidations.isRequired, errorMessage: 'Batch name is required.'},
        {type: textValidations.length, minVal: 1, maxVal: 100, errorMessage: 'Cardholder name should be between 1 and 100 symbols long.'}
    ];
};
