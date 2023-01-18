import {fromJS} from 'immutable';
import {
    validationTypes,
    textValidations,
    arrayValidations,
    dropdownValidations
} from 'ut-front-react/validator/constants';
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

/**
 * Validate currency denominations' descending order
 */
export const validateDenomination = sourceMap => {
    let cassettes = fromJS({
        cassette1: {
            currency: sourceMap.get('cassette1Currency'),
            denomination: sourceMap.get('cassette1Denomination')
        },
        cassette2: {
            currency: sourceMap.get('cassette2Currency'),
            denomination: sourceMap.get('cassette2Denomination')
        },
        cassette3: {
            currency: sourceMap.get('cassette3Currency'),
            denomination: sourceMap.get('cassette3Denomination')
        },
        cassette4: {
            currency: sourceMap.get('cassette4Currency'),
            denomination: sourceMap.get('cassette4Denomination')
        }
    });

    let result = { isValid: true, errors: [] };
    let checkedCurrencies = [];

    cassettes.forEach((cassette) => {
        let currency = cassette.get('currency');
        if (checkedCurrencies.indexOf(currency) > -1) {
            return;
        }

        // cache checked currencies to prevent redundant iterations
        checkedCurrencies.push(currency);
    });

    return result;
};

export const isNumeric = (n) => {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

export const validateAll = (sourceMap, validations) => {
    // debugger;
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
                if (validation.type === validationTypes.numberOnly && rule.type === textValidations.numberOnly) {
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
                if (validation.type === validationTypes.object && rule.type === textValidations.isRequired) {
                    isRequiredRule(currentValue, rule, result);
                }
                if (validation.type === validationTypes.arrayWithArrayElements && rule.type === arrayValidations.isRequired) {
                    rule.keyArray = validation.keyArray;
                    rule.keyText = validation.keyText;
                    arrayWithArrayIsRequiredRule(sourceMap.getIn(validation.keyArray), validation.keyText, rule, result);
                }
                if (validation.type === validationTypes.dropdown && rule.type === dropdownValidations.isRequired) {
                    isRequiredDropdownRule(currentValue, rule, result);
                }
            });
        });
    }
    return result;
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
export function prepareErrors(errors, currentErrors = {}) {
    let result = currentErrors;
    errors.forEach((error) => {
        if (error.key) {
            let errorKey = error.key[error.key.length - 1]; // only last key
            result[errorKey] = error.errorMessage;
        }
    });

    return result;
};
export function compare(initialValues, values) {
    if (initialValues.size === 0) {
        return values.toJS();
    } else {
        let result = {};
        for (var vars in values.toJS()) {
            if (initialValues.get(vars) !== values.get(vars)) {
                result[vars] = values.get(vars);
            }
        };
        return result;
    }
};

function getLocationGroupSize(hiddenFields) {
    /**
     *
     */
    let o = {
        address: 23,
        city: 13,
        state: 2,
        country: 2
    };
    if (hiddenFields.city) {
        o.address = o.address + o.city;
        o.city = 0;
    }
    if (hiddenFields.state) {
        o.address = o.address + o.state;
        o.state = 0;
    }
    if (hiddenFields.country) {
        o.address = o.address + o.country;
        o.country = 0;
    }
    return o;
}

export function getCreateValidator(hiddenFields, requiredFields) {
    var locationGroupSize = getLocationGroupSize(hiddenFields);

    return []
   
    .concat(!hiddenFields.name && requiredFields.name ? {
        key: ['name'],
        type: validationTypes.text,
        rules: [
            {type: textValidations.isRequired, errorMessage: 'Name is required.'}
        ]
    } : [])
    .concat(!hiddenFields.pinMailerFile && requiredFields.pinMailerFile ? {
        key: ['pinMailerFile'],
        type: validationTypes.object,
        rules: [
            {type: textValidations.isRequired, errorMessage: 'Pin Mailer File is required.'}
        ]
    } : [])
    .concat(!hiddenFields.pinLinkFile && requiredFields.pinLinkFile ? {
        key: ['pinLinkFile'],
        type: validationTypes.object,
        rules: [
            {type: textValidations.isRequired, errorMessage: 'Pin Link File is required.'}
        ]
    } : [])

};
