'use strict';
var joi = require('joi');

module.exports = {
    description: 'search accounts by person number',
    notes: ['search accounts by person number'],
    tags: ['search', 'accounts'],
    params: joi.object().keys({
        customerNumber: joi.string().max(50).required(),
        personNumber: joi.string().max(50).required(),
        productId: joi.number().integer().required()
    }),
    result: joi.object().keys({
        account: joi.array().items(joi.object().keys({
            accountNumber: joi.string(),
            accountTypeName: joi.string(),
            availableBalance: joi.number().integer(),
            currency: joi.string(),
            customerNumber: joi.string(),
            methodOfOperationId: joi.string().allow('', null)
        })).required(),
        accountLink: joi.array().items(joi.object().keys({
            accountLinkId: joi.number().required(),
            name: joi.string().required(),
            code: joi.number().required()
        })).allow([]).required()
    }).required()
};
