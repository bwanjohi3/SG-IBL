'use strict';
var joi = require('joi');

module.exports = {
    description: 'fetch card in use',
    notes: ['fetch card in use'],
    tags: ['card', 'inUse'],
    params: joi.object({
        orderBy: joi.array().items(joi.object({
            column: joi.string().min(1).max(128),
            direction: joi.string().valid(['ASC', 'DESC'])
        })),
        filterBy: joi.object({
            statusId: joi.number().min(1),
            productId: joi.number().min(1),
            typeId: joi.number().min(1),
            issuingBranchId: joi.number().min(1),
            customerNumber: joi.string().max(30).allow('').error(new Error('Invalid customer number')),
            cardNumber: joi.string().max(20).allow('').error(new Error('Invalid card number')),
            customerName: joi.string().max(100).allow('').error(new Error('Invalid customer name')),
            cardHolderName: joi.string().max(100).allow('').error(new Error('Invalid cardholder name')),
            personName: joi.string().max(100).allow('').error(new Error('Invalid person name')),
            currentBranchId: joi.number().min(1)
        }),
        paging: joi.object({
            pageNumber: joi.number().min(1).required(),
            pageSize: joi.number().min(1).required()
        }),
        cardId: joi.number().min(1)
    }),
    result: joi.any()
};
