import { validationTypes, textValidations, arrayValidations, dropdownValidations } from 'ut-front-react/validator/constants';
import {
    isRequiredRule,
    lengthRule,
    isRequiredArrayRule,
    isNumberOnlyRule,
    isRequiredDropdownRule,
    isValidEmailRuleArray,
    isNumberOnlyRuleArray,
    lengthRuleArray,
    arrayWithTextLengthRule,
    regexRule,
    isUniqueValueRule,
    arrayWithArrayIsRequiredRule
} from 'ut-front-react/validator';

export const sameStatusIds = (list) => {
    return list.reduce((prev, cur) => {
        if (prev === 0) {
            return cur.statusId;
        } else if (prev !== cur.statusId) {
            return -1;
        } else {
            return cur.statusId;
        }
    }, 0);
};

/*
    Every validation has errorMessage prop

    Example usage
    validation: [
        {
            key: '['cardholdername']',
            type: validationTypes.text,
            validations: [
                {type: textValidations.isRequired, errorMessage: 'Cardholdername name is required'},
                {type: textValidations.length, minVal: 3, maxVal: 5, errorMessage: 'Cardholdername Name should be between 3 and 5 symbols long'}
            ]
        }
    ]
*/

export const validateAll = (sourceMap, validations) => {
    let result = { isValid: true, errors: [] };
    if (validations) {
        validations.forEach((validation) => {
            let currentValue;
            if (validation.key) {
                currentValue = sourceMap.getIn(validation.key);
            }
            validation.rules.forEach((rule) => {
                rule.key = validation.key;
                if (validation.type === validationTypes.text && rule.type === textValidations.isRequired) {
                    isRequiredRule(currentValue, rule, result);
                }
                if (validation.type === validationTypes.text && rule.type === textValidations.numberOnly) {
                    isNumberOnlyRule(currentValue, rule, result);
                }
                if (validation.type === validationTypes.text && rule.type === textValidations.length) {
                    lengthRule(currentValue, rule.minVal, rule.maxVal, rule, result);
                }
                if (validation.type === validationTypes.text && rule.type === textValidations.regex) {
                    regexRule(currentValue, rule.value, rule, result);
                }
                if (validation.type === validationTypes.text && rule.type === textValidations.uniqueValue) {
                    isUniqueValueRule(currentValue, rule.values, rule, result);
                }
                if (validation.type === validationTypes.array && rule.type === arrayValidations.isRequired) {
                    isRequiredArrayRule(currentValue, rule, result);
                }
                if (validation.type === validationTypes.array && rule.type === arrayValidations.numberOnly) {
                    isNumberOnlyRuleArray(currentValue, rule, result);
                }
                if (validation.type === validationTypes.array && rule.type === arrayValidations.email) {
                    isValidEmailRuleArray(currentValue, rule, result);
                }
                if (validation.type === validationTypes.array && rule.type === textValidations.length) {
                    lengthRuleArray(currentValue, rule.minVal, rule.maxVal, rule, result);
                }
                if (validation.type === validationTypes.arrayWithTextElements && rule.type === textValidations.length) {
                    rule.keyArray = validation.keyArray;
                    rule.keyText = validation.keyText;
                    arrayWithTextLengthRule(sourceMap.getIn(validation.keyArray), validation.keyText, rule.minVal, rule.maxVal, rule, result);
                }
                if (validation.type === validationTypes.arrayWithArrayElements && rule.type === arrayValidations.isRequired) {
                    rule.keyArray = validation.keyArray;
                    rule.keyText = validation.keyText;
                    arrayWithArrayIsRequiredRule(sourceMap.getIn(validation.keyArray), validation.keyText, rule, result);
                }
                if (validation.type === validationTypes.dropdown && rule.type === dropdownValidations.isRequired) {
                    isRequiredDropdownRule(currentValue, rule, result);
                }
                // if (validation.type === validationTypes.defaultRole && rule.type === defaultRoleValidations.isRequired) {
                //     defaultRoleRule(currentValue, getAssignedRoles(sourceMap.get('roles'), sourceMap.getIn(['localData', 'assignedRoles'])), rule, result);
                // }

                // let lengthDiff = result.errors.length - startErrorsLength;
                // if (lengthDiff > 0) {
                //     for (let i = result.errors.length - (lengthDiff); i <= result.errors.length - 1; i += 1) {
                //         result.errors[i].tabIndex = tabIndex;
                //     }
                // }
            });
        });
    }
    return result;
};

export const validate = (currentValue, validation) => {
    let result = { isValid: true, errors: [] };
    validation.rules.forEach((rule) => {
        rule.key = validation.key;
        if (validation.type === validationTypes.text && rule.type === textValidations.isRequired) {
            isRequiredRule(currentValue, rule, result);
        }
        if (validation.type === validationTypes.text && rule.type === textValidations.length) {
            lengthRule(currentValue, rule.minVal, rule.maxVal, rule, result);
        }
        if (validation.type === validationTypes.text && rule.type === textValidations.regex) {
            regexRule(currentValue, rule.value, rule, result);
        }
        if (validation.type === validationTypes.text && rule.type === textValidations.uniqueValue) {
            isUniqueValueRule(currentValue, rule.values, rule, result);
        }
        if (validation.type === validationTypes.array && rule.type === arrayValidations.isRequired) {
            isRequiredArrayRule(currentValue, rule, result);
        }
        if (validation.type === validationTypes.array && rule.type === arrayValidations.numberOnly) {
            isNumberOnlyRuleArray(currentValue, rule, result);
        }
        if (validation.type === validationTypes.array && rule.type === arrayValidations.email) {
            isValidEmailRuleArray(currentValue, rule, result);
        }
        if (validation.type === validationTypes.array && rule.type === textValidations.length) {
            lengthRuleArray(currentValue, rule.minVal, rule.maxVal, rule, result);
        }
        // if (validation.type === validationTypes.arrayWithTextElements && rule.type === textValidations.length) {
        //     rule.keyArray = validation.keyArray;
        //     rule.keyText = validation.keyText;
        //     arrayWithTextLengthRule(sourceMap.getIn(validation.keyArray), validation.keyText, rule.minVal, rule.maxVal, rule, result);
        // }
        // if (validation.type === validationTypes.arrayWithArrayElements && rule.type === arrayValidations.isRequired) {
        //     rule.keyArray = validation.keyArray;
        //     rule.keyText = validation.keyText;
        //     arrayWithArrayIsRequiredRule(sourceMap.getIn(validation.keyArray), validation.keyText, rule, result);
        // }
        if (validation.type === validationTypes.dropdown && rule.type === dropdownValidations.isRequired) {
            isRequiredDropdownRule(currentValue, rule, result);
        }
    });

    return result;
};

export function prepareErrors(errors, currentErrors = {}) {
    let result = currentErrors;
    errors.forEach((error) => {
        if (error.key) {
            let errorKey = error.key[error.key.length - 1]; // only last key
            result[errorKey] = error.errorMessage;
        }
        // else if (error.keyArray && error.keyText) {
        //     let errorKey = error.keyArray[error.keyArray.length - 1] + '-' + error.keyText[error.keyText.length - 1] + '-' + error.index;
        //     result[errorKey] = error.errorMessage;
        // }
    });

    return result;
};
