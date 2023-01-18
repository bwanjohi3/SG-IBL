'use strict';
var joi = require('joi');

module.exports = {
    description: 'fetch batch details',
    notes: ['fetch batch details'],
    tags: ['card', 'batch', 'get'],
    params: joi.object({
        batchId: joi.number().min(1).required(),
        IsPINMailPrinted: joi.number().min(0).max(1).optional(),
        paging: joi.object({
            pageNumber: joi.number().required(),
            pageSize: joi.number().required()
        }).optional(),
        orderBy: joi.array().items(joi.object({
            column: joi.string().min(1).max(128).required(),
            direction: joi.any().allow(['ASC', 'DESC']).required()
        })).optional(),
        filterBy: joi.object({
            customerName: joi.string().min(1).max(20).optional(),
            cardNumber: joi.string().min(1).max(100).optional()
        }).optional()
    }),
    result: joi.any()
};
