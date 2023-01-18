import immutable from 'immutable';

export function getVisibleAccounts(moduleFields, accountsConfigImmutable) {
    let visibleaAccountsFields = moduleFields.reduce((prev, cur) => {
        if (accountsConfigImmutable.get('fields').indexOf(cur.name) >= 0) {
            let currentCustomStyle = accountsConfigImmutable.getIn(['customStyles', cur.name]);
            if (currentCustomStyle) {
                cur.style = currentCustomStyle.toJS();
            }
            prev.push(cur);
        }
        return prev;
    }, []);

    return visibleaAccountsFields;
}

export function intersectChecked(left, right) {
    let result = left;

    right.forEach((current) => {
        if (!left.includes(current)) {
            result = result.push(current);
        }
    });
    return result;
}

export function removeChecked(left, right) {
    let removed = immutable.Map();

    right.forEach((current) => {
        removed = removed.set(current.get('actorId'), true);
    });
    let result = left.filter((leftCurrent) => {
        return !removed.has(leftCurrent.get('actorId'));
    });
    return result;
}

export function validateAccounts(unlinked, linked) {
    let errors = immutable.Map({});
    if (linked.size === 0 && unlinked.size === 0) {
        errors = errors.set('hasAccountsError', true);
    }
    if (unlinked.size > 0 && linked.size === 0) {
        errors = errors.set('hasLinkedAccountsError', true);
    }
    let primary = linked.find((account) => {
        return !!account.get('isPrimary');
    });
    if (!primary) {
        errors = errors.set('hasPrimaryAccountError', true);
    }

    return errors;
};

export function validateUploads(attachments) {
    let errors = immutable.Map({});
    attachments.forEach((attachment, i) => {
        if (attachment.get('filename') && !attachment.get('documentTypeId')) {
            errors = errors.set(i, true);
        }
    });

    return errors;
};

export function prepareAttachmentsToUpdate(attachments) {
    let uniqueId = -1;
    let filteredattachments = attachments
    .filter((attachment) => {
        let result = !!attachment.get('filename');
        return result;
    })
    .reduce((prev, cur) => {
        let newDocument = immutable.Map({
            documentId: cur.get('documentId'),
            documentTypeId: cur.get('documentTypeId')
        });

        let documentExist = prev.get('document').find((doc) => {
            return doc.get('documentId') === cur.get('documentId');
        });

        let lastAttachmentWithSameType = prev
            .get('attachment')
            .concat(prev.get('newAttachments'))
            .findLast((att) => {
                return att.get('documentTypeId') === cur.get('documentTypeId');
            });

        let newPage = (lastAttachmentWithSameType && lastAttachmentWithSameType.get('page') !== null) ? lastAttachmentWithSameType.get('page') + 1 : 1;

        let hasChangedUpload = cur.get('isNew') && cur.get('content');
        let hasChangedOnlyDocument = cur.get('isNew') && !cur.get('content');

        if (hasChangedUpload) {
            let newAttachment = cur
                .set('documentId', (--uniqueId).toString())
                .set('page', newPage)
                .delete('content')
                .delete('contentType')
                .delete('contentEncoding')
                .delete('isNew');

            return prev
                .update('newAttachments', newAttachments => newAttachments.push(newAttachment))
                .update('document', document => document.push(newDocument.set('documentId', newAttachment.get('documentId'))));
        } else if (hasChangedOnlyDocument) {
            let attachmentToAdd = cur
                .set('documentId', (--uniqueId).toString())
                .set('page', newPage)
                .delete('isNew');

            return prev
                .update('attachment', attachment => attachment.push(attachmentToAdd))
                .update('document', document => document.push(newDocument.set('documentId', attachmentToAdd.get('documentId'))));
        } else {
            let newAttachment = cur
                .set('page', newPage);
            return prev
                .update('attachment', attachment => attachment.push(newAttachment))
                .update('document', document => documentExist ? document : document.push(newDocument)); // if this documentId is in prev.get('document') it shouldn't add new object to prev.get('document')
        }
    }, immutable.fromJS({newAttachments: [], attachment: [], document: []})); // attachment are from application.get, newAttachments are from add document

    return filteredattachments;
}
