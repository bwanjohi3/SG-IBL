import React from 'react';
import { validationTypes, textValidations, dropdownValidations } from 'ut-front-react/validator/constants.js';
import Text from 'ut-front-react/components/Text';
import {prepareUploads} from './../helpers';

export function prepareNoNameApplicationToCreate(application, linkedAccounts, cardId, attachments) {
    let account = linkedAccounts.map((account, index) => {
        let mappedAccount = {
            isPrimary: account.get('isPrimary') || 0,
            accountNumber: account.get('accountNumber'),
            accountTypeName: account.get('accountTypeName'),
            currency: account.get('currency'),
            accountOrder: ++index // accountOrder should start from 1
        };
        if (account.get('accountLinkId')) {
            mappedAccount.accountLinkId = account.get('accountLinkId');
        }
        return mappedAccount;
    }).toArray();

    let uploadData = prepareUploads(attachments);

    return {
        application: {
            ...application
        },
        cardId,
        account,
        attachment: uploadData.get('attachments').toJS(),
        document: uploadData.get('documents').toJS()
    };
};

export function getCreateValidator() {
    return [
        cardNumberValidator,
        productIdValidator,
        customerNameValidator,
        personNameValidator,
        personNumberValidator
    ];
}

export const cardNumberValidator = {
    key: ['cardId'],
    type: validationTypes.text,
    rules: getCardNumberValidationRules()
};

export const productIdValidator = {
    key: ['productId'],
    type: validationTypes.dropdown,
    rules: [
        {type: dropdownValidations.isRequired, errorMessage: <Text>Search for a valid card and card product will be populated.</Text>}
    ]
};

export const customerNameValidator = {
    key: ['customerName'],
    type: validationTypes.text,
    rules: getCustomerNameValidationRules()
};

export const personNameValidator = {
    key: ['personName'],
    type: validationTypes.text,
    rules: getPersonNameValidationRules()
};

export const personNumberValidator = {
    key: ['personNumber'],
    type: validationTypes.text,
    rules: getPersonNumberValidationRules()
};

export function getCardNumberValidationRules() {
    return [
        {type: textValidations.isRequired, errorMessage: <Text>Please search for valid card.</Text>},
        {type: textValidations.length, minVal: 0, maxVal: 30, errorMessage: <Text>Card number should be between 0 and 30 symbols long.</Text>}
    ];
};

export function getCustomerNameValidationRules() {
    return [
        {type: textValidations.isRequired, errorMessage: <Text>Customer name is required.</Text>}
    ];
};

export function getPersonNameValidationRules() {
    return [
        {type: textValidations.isRequired, errorMessage: <Text>Person name is required.</Text>}
    ];
};

export function getPersonNumberValidationRules() {
    return [
        {type: textValidations.isRequired, errorMessage: <Text>Person name is invalid.</Text>}
    ];
};
