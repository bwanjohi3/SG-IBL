'use strict';
var joi = require('joi');

module.exports = {
    description: 'create no name card application',
    notes: ['create no name card application'],
    tags: ['noname', 'card', 'application', 'create'],
    params: joi.object().keys({
        application: joi.object().keys({
            customerName: joi.string().min(1).max(100).required(),
            customerNumber: joi.string().min(1).max(30).required(),
            holderName: joi.string().min(1).max(30).required(),
            personName: joi.string().min(1).max(100).required(),
            personNumber: joi.string().min(1).max(30).required(),
            productId: joi.number().required(),
            typeId: joi.number().required(),
            cardNumber: joi.string().min(1).required(),
            makerComments: joi.string().allow(''),
            issueTypeId : joi.any()

        }).required(),
        account: joi.array().items(joi.object().keys({
            accountNumber: joi.string().max(20).required(),
            accountTypeName: joi.string().min(1).max(200).required(),
            currency: joi.string().max(200).required(),
            accountOrder: joi.number().integer().required(),
            isPrimary: joi.number().integer().min(0).max(1).required(),
            accountLinkId: joi.number().integer().required()
        })).required(),
        cardId: joi.string().required(),
        attachment: joi.array().items(joi.object().keys({
            filename: joi.string().required(),
            documentId: joi.string().required(),
            page: joi.number().integer().required()
        })).optional(),
        document: joi.array().items(joi.object().keys({
            documentId: joi.string().max(100).required(),
            documentTypeId: joi.string().max(30).required()
        })).optional()
    }),
    result: joi.object().keys({
        cardApplication: joi.array().items(joi.object().keys({
            customerName: joi.string().min(1).max(100).required(),
            customerNumber: joi.string().min(1).max(30).required(),
            holderName: joi.string().min(1).max(30).allow(null).required(),
            personName: joi.string().min(1).max(100).required(),
            personNumber: joi.string().min(1).max(30).required(),
            productId: joi.number().required(),
            targetBranchId: joi.string().allow(null).required()
        })).required(),
        cardApplicationAccount: joi.array().items(joi.object().keys({
            accountNumber: joi.string().max(20).required(),
            accountTypeName: joi.string().min(1).max(200).required(),
            currency: joi.string().max(200).required(),
            accountOrder: joi.number().integer().required(),
            isPrimary: joi.number().integer().min(0).max(1).required()
        })).required()
    }).required()
};
