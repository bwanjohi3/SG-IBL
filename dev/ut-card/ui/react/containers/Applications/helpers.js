import { textValidations } from 'ut-front-react/validator/constants.js';
import immutable from 'immutable';

export const availableAccountsFields = [{
    name: 'accountTypeName',
    title: 'Available Accounts',
    style: {width: 'auto'}
}, {
    name: 'currency',
    title: 'Currency',
    style: {width: '15%'}
}, {
    name: 'accountNumber',
    style: {width: 'auto'}
}, {
    name: 'methodOfOperationId',
    title: 'Method Of Operation',
    style: {width: 'auto'}
}];

export const linkedAccountsFields = [{
    name: 'accountTypeName',
    title: 'Linked Accounts',
    style: {width: 'auto'}
}, {
    name: 'currency',
    title: 'Currency',
    style: {width: '15%'}
}, {
    name: 'accountNumber',
    style: {width: 'auto'}
}, {
    name: 'methodOfOperationId',
    title: 'Method Of Operation',
    style: {width: 'auto'}
}];

export function updateError(action, errors) {
    let newErrors = errors;
    if (action.params.error) {
        newErrors = newErrors.set(action.params.key, action.params.errorMessage);
    } else {
        newErrors = newErrors.delete(action.params.key);
    }
    return newErrors;
};

export function getCardholderValidationRules() {
    return [
        {type: textValidations.isRequired, errorMessage: 'Cardholder name is required.'},
        {type: textValidations.length, minVal: 2, maxVal: 26, errorMessage: 'Cardholder name should be between 2 and 26 symbols long.'},
        {type: textValidations.regex, value: /^[ a-zA-Z]+/, errorMessage: 'Cardholder name can contain only letters and spaces.'}
    ];
};

export function prepareUploads(attachments) {
    let documentId = 1000;
    let documentsMap = immutable.fromJS({});
    let documentsData = immutable.fromJS([]);
    let attachmentsData = immutable.fromJS([]);
    let uploadData = attachments.filter((attachment) => {
        return !!attachment.get('filename');
    });

    // iterate through attachments and generate documents with fake unique documentId
    uploadData.forEach((attachment) => {
        if (!documentsMap.has(attachment.get('documentTypeId'))) {
            let newDocument = immutable.fromJS({
                documentId: (++documentId).toString(),
                documentTypeId: attachment.get('documentTypeId')
            });
            documentsMap = documentsMap.set(newDocument.get('documentTypeId'), newDocument);
            documentsData = documentsData.push(newDocument);
        }
    });

    uploadData.forEach((attachment) => {
        let newAttachmentDocumentId = documentsMap.getIn([attachment.get('documentTypeId'), 'documentId']);
        let attachmentWithSameDocumentId = attachmentsData.findLast((data) => { return data.get('documentId') === newAttachmentDocumentId; });
        let newAttachment = immutable.fromJS({
            filename: attachment.get('filename'),
            documentId: newAttachmentDocumentId,
            page: attachmentWithSameDocumentId ? attachmentWithSameDocumentId.get('page') + 1 : 1
        });
        attachmentsData = attachmentsData.push(newAttachment);
    });

    return immutable.fromJS({documents: documentsData, attachments: attachmentsData});
};

function prepareMultipleApplicationsForUpdate(applicationData) {
    return applicationData.map((application) => {
        return {
            applicationId: application.applicationId,
            batchId: application.batchId
        };
    });
}

function prepareSingleApplicationForUpdate(applicationData) {
    return {
        applicationId: applicationData.applicationId,
        batchId: applicationData.batchId,
        customerId: applicationData.customerId,
        customerName: applicationData.customerName,
        customerNumber: applicationData.customerNumber,
        issuingBranchId: applicationData.issuingBranchId,
        targetBranchId: applicationData.targetBranchId,
        productId: applicationData.productId,
        typeId: applicationData.typeId,
        personId: applicationData.personId,
        personNumber: applicationData.personNumber,
        personName: applicationData.personName,
        reasonId: applicationData.reasonId,
        comments: applicationData.comments,
        makerComments: applicationData.makerComments,
        holderName: applicationData.holderName
    };
}

export function prepareApplicationDataForUpdate(applicationData) {
    let preparedApplication;
    if (Array.isArray(applicationData)) {
        preparedApplication = prepareMultipleApplicationsForUpdate(applicationData);
    } else {
        preparedApplication = prepareSingleApplicationForUpdate(applicationData);
    }
    return preparedApplication;
};
