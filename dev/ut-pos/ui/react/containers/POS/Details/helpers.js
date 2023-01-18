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
    .concat(!hiddenFields.terminalNumber && requiredFields.terminalNumber ? {
        key: ['terminalNumber'],
        type: validationTypes.text,
        rules: [
            {type: textValidations.isRequired, errorMessage: 'Terminal Number is required.'}
        ]
    } : [])
    .concat(!hiddenFields.terminalSerial && requiredFields.terminalSerial ? {
        key: ['terminalSerial'],
        type: validationTypes.text,
        rules: [
            {type: textValidations.isRequired, errorMessage: 'Terminal Serial is required.'}
        ]
    } : [])
    .concat(!hiddenFields.tmkkvv ? {
        key: ['tmkkvv'],
        type: validationTypes.text,
        rules: [
            {type: textValidations.regex, value: /^[0-9A-F]{6}$/g, errorMessage: 'TMKKVV should be 6 hexadecimal characters long.'}
        ].concat(requiredFields.tmkkvv ? [{type: textValidations.isRequired, errorMessage: 'TMKKVV is required.'}] : [])
    } : [])
    .concat(!hiddenFields.merchantType ? {
        key: ['merchantType'],
        type: validationTypes.text,
        rules: [
            {type: textValidations.length, minVal: 1, maxVal: 4, errorMessage: 'Merchant Type should be between 1 and 4 characters long.'}
        ].concat(requiredFields.merchantType ? [{type: textValidations.isRequired, errorMessage: 'Merchant Type is required.'}] : [])
    } : [])
    .concat(!hiddenFields.terminalId && requiredFields.terminalId ? {
        key: ['terminalId'],
        type: validationTypes.text,
        rules: [
            {type: textValidations.isRequired, errorMessage: 'Terminal ID is required.'}
        ]
    } : [])
    .concat(!hiddenFields.adminPassword ? {
        key: ['adminPassword'],
        type: validationTypes.text,
        rules: [
            {type: textValidations.regex, value: /^[0-9]{6,12}$/g, errorMessage: 'Password must be from 6 to 12 digits.'}
        ].concat(requiredFields.adminPassword ? [{type: textValidations.isRequired, errorMessage: 'Administrator password is required.'}] : [])
    } : [])    
    .concat(!hiddenFields.terminalName ? {
        key: ['terminalName'],
        type: validationTypes.text,
        rules: [
            {type: textValidations.length, minVal: 1, maxVal: 40, errorMessage: 'Name and location should be between 1 and 40 characters long.'}
        ].concat(requiredFields.terminalName ? [{type: textValidations.isRequired, errorMessage: 'Name and location is required.'}] : [])
    } : [])
    .concat(!hiddenFields.tmk ? {
        key: ['tmk'],
        type: validationTypes.text,
        rules: [
            {type: textValidations.regex, value: /^U[0-9A-F]{32}$/g, errorMessage: 'TMK should start with U and followed by 32 hexadecimal characters.'}
        ].concat(requiredFields.tmk ? [{type: textValidations.isRequired, errorMessage: 'TMK is required.'}] : [])
    } : [])
    .concat(!hiddenFields.name && requiredFields.name ? {
        key: ['name'],
        type: validationTypes.text,
        rules: [
            {type: textValidations.isRequired, errorMessage: 'Name is required.'}
        ]
    } : [])
    .concat(!hiddenFields.identificationCode ? {
        key: ['identificationCode'],
        type: validationTypes.text,
        rules: [
            {type: textValidations.length, minVal: 1, maxVal: 15, errorMessage: 'Identification Code should be between 1 and 15 characters long.'}
        ].concat(requiredFields.identificationCode ? [{type: textValidations.isRequired, errorMessage: 'Identification Code is required.'}] : [])
    } : [])
    .concat(!hiddenFields.customization && requiredFields.customization ? {
        key: ['customization'],
        type: validationTypes.text,
        rules: [
            {type: textValidations.isRequired, errorMessage: 'Menu profile is required.'}
        ]
    } : [])
    .concat(!hiddenFields.tillAccount && requiredFields.tillAccount ? [{
        key: ['tillAccount'],
        type: validationTypes.text,
        rules: [
        {type: textValidations.isRequired, errorMessage: 'Till account is required.'}
        ]
    }] : [])
    .concat(!hiddenFields.feeAccount && requiredFields.feeAccount ? [{
        key: ['feeAccount'],
        type: validationTypes.text,
        rules: [
            {type: textValidations.isRequired, errorMessage: 'Fee Account is required.'}
        ]}] : [])
    .concat(!hiddenFields.commissionAccount && requiredFields.commissionAccount ? [{
        key: ['commissionAccount'],
        type: validationTypes.text,
        rules: [
            {type: textValidations.isRequired, errorMessage: 'Commission Account is required.'}
        ]}] : [])

    .concat(!hiddenFields.address ? [{
        key: ['address'],
        type: validationTypes.text,
        rules: [
            {type: textValidations.length, minVal: 1, maxVal: locationGroupSize.address, errorMessage: `Address should be between 1 and ${locationGroupSize.address} characters long.`}
        ].concat(requiredFields.address ? [{type: textValidations.isRequired, errorMessage: 'Address is required.'}] : [])
    }] : [])
    .concat(!hiddenFields.city ? [{
        key: ['city'],
        type: validationTypes.text,
        rules: [
            {type: textValidations.length, minVal: 1, maxVal: 13, errorMessage: `City should be between 1 and 13 characters long.`}
        ].concat(requiredFields.city ? [{type: textValidations.isRequired, errorMessage: 'City is required.'}] : [])
    }] : [])
    .concat(!hiddenFields.state ? [{
        key: ['state'],
        type: validationTypes.text,
        rules: [
            {type: textValidations.length, minVal: 2, maxVal: 2, errorMessage: 'State should be 2 characters long.'}
        ].concat(requiredFields.state ? [{type: textValidations.isRequired, errorMessage: 'State is required.'}] : [])
    }] : [])
    .concat(!hiddenFields.country ? [{
        key: ['country'],
        type: validationTypes.text,
        rules: [
            {type: textValidations.length, minVal: 2, maxVal: 2, errorMessage: 'Country should be 2 characters long.'}
        ].concat(requiredFields.country ? [{type: textValidations.isRequired, errorMessage: 'Country is required.'}] : [])
    }] : [])
    .concat(!hiddenFields.branch ? [{
        key: ['businessUnitId'],
        type: validationTypes.dropdown,
        rules: [
            {type: dropdownValidations.isRequired, errorMessage: 'Please select Business Unit.'}
        ].concat(requiredFields.businessUnitId ? [{type: dropdownValidations.isRequired, errorMessage: 'Business Unit is required.'}] : [])
    }] : []);
};
