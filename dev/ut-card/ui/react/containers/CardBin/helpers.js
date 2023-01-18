import { validationTypes, textValidations, dropdownValidations } from 'ut-front-react/validator/constants.js';

export function updateError(action, errors) {
    let newErrors = errors;
    if (action.params.error) {
        newErrors = newErrors.set(action.params.key, action.params.errorMessage);
    } else {
        newErrors = newErrors.delete(action.params.key);
    }
    return newErrors;
};

export function validateEndBin(startBin, endBin) {
    if (endBin < startBin) {
        return {
            errors: {
                errorMessage: 'Must be greater than or equal to ' + startBin,
                key: ['endBin'],
                type: 'minValue'
            },
            isValid: false
        };
    }
    return {};
}

export function getCreateBinCommonValidator() {
    return [
        {
            key: ['description'],
            type: validationTypes.text,
            rules: getDescriptionValidationRules()
        },
        {
            key: ['ownershipTypeId'],
            type: validationTypes.dropdown,
            rules: getOwnershipValidationRules()
        }
    ];
}

export function getCreateBinOwnValidator() {
    return [
        {
            key: ['startBin'],
            type: validationTypes.text,
            rules: getBinValidationRules()
        }
    ];
}

export function getCreateBinExternalValidator() {
    return [
        {
            key: ['startBin'],
            type: validationTypes.text,
            rules: getBinValidationRules()
        },
        {
            key: ['endBin'],
            type: validationTypes.text,
            rules: getBinValidationRules()
        }
    ];
}

export function getBinValidationRules() {
    return [
        {type: textValidations.isRequired, errorMessage: 'The field is required.'},
        {type: textValidations.numberOnly, errorMessage: 'Please enter a number.'},
        {type: textValidations.regex, value: /^[1-9]{1}[0-9]{5,7}$/, errorMessage: 'The value should not start with "0" and should be 6 to 8 digits.'}
    ];
};

export function getDescriptionValidationRules() {
    return [
        {type: textValidations.isRequired, errorMessage: 'Description is required.'},
        {type: textValidations.length, maxVal: 100, errorMessage: 'Description should be less than 100 symbols long'}
    ];
};

export function getOwnershipValidationRules() {
    return [
        {type: dropdownValidations.isRequired, errorMessage: 'Ownership is required.'}
    ];
};
