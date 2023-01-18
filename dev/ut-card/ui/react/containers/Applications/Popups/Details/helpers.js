import { validationTypes, dropdownValidations } from 'ut-front-react/validator/constants.js';
import {getCardholderValidationRules} from './../../helpers';
import { prepareAttachmentsToUpdate } from './../../../helpers';

export function prepareApplicationToUpdate(application, linkedAccounts, attachments) {
    let account = linkedAccounts.map((account, index) => {
        let mappedAccount = {
            applicationId: application.applicationId,
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

    let filteredattachments = prepareAttachmentsToUpdate(attachments);

    return {
        application: application,
        account,
        attachment: filteredattachments.get('attachment').toJS(),
        newAttachments: filteredattachments.get('newAttachments').toJS(),
        document: filteredattachments.get('document').toJS()
    };
};

export function getUpdateValidator() {
    return [
        {
            key: ['data', 'productId'],
            type: validationTypes.dropdown,
            rules: [
                {type: dropdownValidations.isRequired, errorMessage: 'Please select card product.'}
            ]
        },
        {
            key: ['data', 'holderName'],
            type: validationTypes.text,
            rules: getCardholderValidationRules()
        },
        {
            key: ['data', 'targetBranchId'],
            type: validationTypes.dropdown,
            rules: [
                {type: dropdownValidations.isRequired, errorMessage: 'Please select business unit.'}
            ]
        }
    ];
}
