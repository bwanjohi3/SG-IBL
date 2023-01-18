'use strict';
var joi = require('joi');

module.exports = {
    description: 'update card application status',
    notes: ['update card application status'],
    tags: ['card', 'application', 'update', 'status'],
    params: joi.object().keys({
        application: joi.alternatives().try(
            joi.object().keys({
                applicationId: joi.number().integer().required(),
                batchId: joi.number().integer().allow(null).required(),
                customerId: joi.number().integer().allow(null).required(),
                customerNumber: joi.string().min(1).max(30).required(),
                customerName: joi.string().min(1).max(100).required(),
                holderName: joi.string().min(1).max(30).allow(null).required(),
                issuingBranchId: joi.string().allow(null).required(),
                targetBranchId: joi.string().allow(null).required(),
                productId: joi.number().required(),
                typeId: joi.number().required(),
                personId: joi.number().integer(),
                personNumber: joi.string().allow('').max(30).required(),
                personName: joi.string().allow('').min(1).max(100).required(),
                reasonId: joi.number().integer().allow(null).required(),
                comments: joi.string().max(1000).allow([null, '']).required(),
                makerComments: joi.string().allow(['', null]).required()
            }),
            joi.array().items(joi.object().keys({
                applicationId: joi.number().integer().required(),
                batchId: joi.number().integer().allow(null).optional()
            }))
        ),
        applicationActionId: joi.number().integer().min(0).required(),
        batch: joi.object().keys({
            targetBranchId: joi.number().min(1).required(),
            batchName: joi.string().min(1).max(100).required()
        }),
        account: joi.array().items(joi.object().keys({
            applicationId: joi.number().integer().required(),
            applicationAccountId: joi.number().allow(null),
            accountNumber: joi.string().max(20).required(),
            accountTypeName: joi.string().min(1).max(200).required(),
            currency: joi.string().max(200).required(),
            accountOrder: joi.number().integer().required(),
            isPrimary: joi.boolean().allow(0, 1).required(),
            accountLinkId: joi.number().integer().optional()
        })),
        attachment: joi.array().items(joi.object().keys({
            attachmentId: joi.number().integer().required(),
            contentType: joi.string().required(),
            documentId: joi.string().max(20).required(),
            documentTypeId: joi.string().max(200).optional(),
            extension: joi.string().max(50).required(),
            filename: joi.string().required(),
            hash: joi.string().required(),
            page: joi.number().integer().required()
        })),
        newAttachments: joi.array().items(joi.object().keys({
            documentId: joi.string().required(),
            documentTypeId: joi.string().optional(),
            filename: joi.string().required(),
            page: joi.number().integer().required()
        })),
        document: joi.array().items(joi.object().keys({
            documentId: joi.string().max(100).required(),
            documentTypeId: joi.string().required()
        })).optional()
    }),
    // TODO: handle error instead of result
    result: joi.array()
};
