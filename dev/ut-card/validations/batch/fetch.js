'use strict';
var joi = require('joi');

module.exports = {
    description: 'fetch batch list',
    notes: ['fetch batch list'],
    tags: ['card', 'batch', 'fetch'],
    params: joi.object().keys({
        orderBy: joi.array().items(joi.object().keys({
            column: joi.string().min(1).max(128),
            direction: joi.string().valid(['ASC', 'DESC'])
        })).optional(),
        filterBy: joi.object().keys({
            statusId: joi.number().min(1).allow(null),
            productId: joi.number().min(1).allow(null),
            targetBranchId: joi.number().min(1).allow(null),
            issuingBranchId: joi.number().min(1).allow(null),
            batchName: joi.string().min(1).max(100).allow(null).error(new Error('Invalid batch name'))
        }).optional(),
        paging: joi.object().keys({
            pageNumber: joi.number().min(1).required(),
            pageSize: joi.number().min(1).required()
        }).optional()
    }),
    result: joi.any()
};
