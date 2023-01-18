'use strict';
var joi = require('joi');

module.exports = {
    description: 'create card application',
    notes: ['create card application'],
    tags: ['card', 'application', 'create'],
    params: joi.object().keys({
        application: joi.object().keys({
            customerName: joi.string().min(1).max(100).required(),
            customerNumber: joi.string().min(1).max(30).required(),
            holderName: joi.string().min(1).max(30).required(),
            personName: joi.string().allow('').max(100).optional(),
            personNumber: joi.string().allow('').max(30).optional(),
            productId: joi.number().required(),
            typeId: joi.number().required(),
            targetBranchId: joi.string().required(),
            issuingBranchId: joi.string().required(),
            makerComments: joi.string().allow('')
        }).required(),
        account: joi.array().items(joi.object().keys({
            accountNumber: joi.string().max(20).required(),
            accountTypeName: joi.string().min(1).max(200).required(),
            currency: joi.string().max(200).required(),
            accountOrder: joi.number().integer().required(),
            isPrimary: joi.number().integer().min(0).max(1).required(),
            accountLinkId: joi.number().integer().optional()
        })).required(),
        attachment: joi.array().items(joi.object().keys({
            filename: joi.string().required(),
            documentId: joi.string().required(),
            page: joi.number().integer().required()
        })).optional(),
        document: joi.array().items(joi.object().keys({
            documentId: joi.string().max(100).required(),
            documentTypeId: joi.string().max(30).required()
        })).optional()
    }).required(),
    result: joi.object().keys({
        cardApplication: joi.array().required(),
        cardApplicationAccount: joi.array().required()
    }).required()
};
