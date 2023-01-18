'use strict';
var joi = require('joi');

module.exports = {
    description: 'get list of cards report',
    notes: ['list of cards report'],
    tags: ['list', 'card', 'report'],
    params: joi.object({
        pageSize: joi.number(),
        pageNumber: joi.number(),
        createdFromDate: joi.string().allow('', null),
        createdToDate: joi.string().allow('', null),
        activatedFromDate: joi.string().allow('', null),
        activatedToDate: joi.string().allow('', null),
        expirationFromDate: joi.string().allow('', null),
        expirationToDate: joi.string().allow('', null),
        destructionFromDate: joi.string().allow('', null),
        destructionToDate: joi.string().allow('', null),
        branchId: joi.number().min(1),
        productId: joi.number().min(1),
        statusId: joi.number().min(1)
    }),
    result: joi.any()
};
