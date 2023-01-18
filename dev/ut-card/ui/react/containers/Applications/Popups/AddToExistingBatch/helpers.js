import { validationTypes, dropdownValidations, arrayValidations } from 'ut-front-react/validator/constants.js';

export function getAddToBatchBatchValidator() {
    return [
        {
            key: ['batchId'],
            type: validationTypes.dropdown,
            rules: [
                {type: dropdownValidations.isRequired, errorMessage: 'Please select batch.'}
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
