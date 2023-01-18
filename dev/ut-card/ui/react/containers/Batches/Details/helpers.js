import { validationTypes } from 'ut-front-react/validator/constants.js';
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
        }
    ];
}

export function getCreateValidatorName() {
    return [
        {
            key: ['batchName'],
            type: validationTypes.text,
            rules: getBatchValidationRules()
        }
    ];
}
