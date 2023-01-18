import React from 'react';
import { validationTypes, textValidations, dropdownValidations } from 'ut-front-react/validator/constants.js';
import Text from 'ut-front-react/components/Text';
import {getCardholderValidationRules, prepareUploads} from './../helpers';

export function prepareNameApplicationToCreate(createStore, accounts, attachments) {
    let preparedObj = {
        // customerId: createStore.getIn(['customer', 'customerId']),
        customerNumber: createStore.getIn(['customer', 'customerNumber']),
        customerName: createStore.getIn(['customer', 'customerName']),
        holderName: createStore.getIn(['cardholder', 'cardholderName']),
        targetBranchId: createStore.getIn(['units', 'targetBranchId']),
        issuingBranchId: createStore.getIn(['units', 'issuingBranchId']),
        productId: createStore.getIn(['product', 'productId']),
        typeId: createStore.getIn(['type', 'typeId']),
        // personId: createStore.getIn(['person', 'personId']),
        personNumber: createStore.getIn(['person', 'personNumber']),
        personName: createStore.getIn(['person', 'personName']),
        makerComments: createStore.get('makerComments')
    };
    let account = accounts.map((account, index) => {
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
        application: preparedObj,
        account,
        attachment: uploadData.get('attachments').toJS(),
        document: uploadData.get('documents').toJS()
    };
};

export function getCreateValidator() {
    return [
        productIdValidator,
        customerNameValidator,
        personNameValidator,
        personNumberValidator,
        {
            key: ['cardholder', 'cardholderName'],
            type: validationTypes.text,
            rules: getCardholderValidationRules()
        },
        {
            key: ['units', 'issuingBranchId'],
            type: validationTypes.dropdown,
            rules: [
                {type: dropdownValidations.isRequired, errorMessage: <Text>Please select card issuing business unit.</Text>}
            ]
        },
        {
            key: ['units', 'targetBranchId'],
            type: validationTypes.dropdown,
            rules: [
                {type: dropdownValidations.isRequired, errorMessage: <Text>Please select business unit.</Text>}
            ]
        }
    ];
}

export const productIdValidator = {
    key: ['product', 'productId'],
    type: validationTypes.dropdown,
    rules: [
        {type: dropdownValidations.isRequired, errorMessage: <Text>Please select card product.</Text>}
    ]
};

export const customerNameValidator = {
    key: ['customer', 'customerName'],
    type: validationTypes.text,
    rules: getCustomerNameValidationRules()
};

export const personNameValidator = {
    id: 'personName',
    key: ['person', 'personName'],
    type: validationTypes.text,
    rules: getPersonNameValidationRules()
};

export const personNumberValidator = {
    id: 'personNumber',
    key: ['person', 'personNumber'],
    type: validationTypes.text,
    rules: getPersonNumberValidationRules()
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
