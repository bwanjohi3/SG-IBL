'use strict';
var joi = require('joi');

module.exports = {
    description: 'fetch card applications',
    notes: ['fetch card applications'],
    tags: ['card', 'application', 'fetch'],
    params: joi.object().keys({
        orderBy: joi.array().items(joi.object({
            column: joi.string().min(1).max(128),
            direction: joi.string().valid(['ASC', 'DESC'])
        })).optional(),
        filterBy: joi.object().keys({
            embossedTypeId: joi.number().allow(null).min(1),
            applicationId: joi.string().allow(null),
            statusId: joi.number().allow(null).min(1),
            productId: joi.number().allow(null).min(1),
            issuingBranchId: joi.string().allow(null),
            customerNumber: joi.string().max(30).allow(null).error(new Error('Invalid customer number')),
            personName: joi.string().max(100).allow(null).error(new Error('Invalid person name')),
            batchName: joi.string().max(100).allow(null).error(new Error('Invalid batch name')),
            cardNumber: joi.string().max(20).allow(null).error(new Error('Invalid card number')),
            customerName: joi.string().max(100).allow(null).error(new Error('Invalid customer name')),
            cardHolderName: joi.string().max(100).allow(null).error(new Error('Invalid cardholder name')),
            currentBranchId: joi.number().allow(null)
        }).optional(),
        paging: joi.object().keys({
            pageNumber: joi.number().min(1).required(),
            pageSize: joi.number().min(1).required()
        }).optional(),
        cardId: joi.number().min(1)
    }),
    result: joi.any()
};
