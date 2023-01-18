import { validationTypes, dropdownValidations } from 'ut-front-react/validator/constants.js';
import {getBatchValidationRules, getNumberOfCardsValidationRules} from './../helpers';

export function getCreateValidator() {
    return [
        {
            key: ['batchName'],
            type: validationTypes.text,
            rules: getBatchValidationRules()
        },
        {
            key: ['numberOfCards'],
            type: validationTypes.text,
            rules: getNumberOfCardsValidationRules()
        },
        typeIdValidator,
        {
            key: ['targetBusinessUnit'],
            type: validationTypes.dropdown,
            rules: [
                {type: dropdownValidations.isRequired, errorMessage: 'Please select business unit.'}
            ]
        },
        {
            key: ['issuingBusinessUnit'],
            type: validationTypes.dropdown,
            rules: [
                {type: dropdownValidations.isRequired, errorMessage: 'Please select issuing business unit.'}
            ]
        }
    ];
}
export function getCreateValidatorNoBatchName() {
    return [
        {
            key: ['numberOfCards'],
            type: validationTypes.text,
            rules: getNumberOfCardsValidationRules()
        },
        typeIdValidator,
        {
            key: ['targetBusinessUnit'],
            type: validationTypes.dropdown,
            rules: [
                {type: dropdownValidations.isRequired, errorMessage: 'Please select business unit.'}
            ]
        },
        {
            key: ['issuingBusinessUnit'],
            type: validationTypes.dropdown,
            rules: [
                {type: dropdownValidations.isRequired, errorMessage: 'Please select issuing business unit.'}
            ]
        }
    ];
}

export const typeIdValidator = {
    key: ['cardType'],
    type: validationTypes.dropdown,
    rules: [
        {type: dropdownValidations.isRequired, errorMessage: 'Please select card type.'}
    ]
};
