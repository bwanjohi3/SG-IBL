'use strict';
var joi = require('joi');

module.exports = {
    description: 'fetch reasons',
    notes: ['fetch card action reasons'],
    tags: ['card', 'action', 'reason'],
    params: joi.object({
        orderBy: joi.array().items(joi.object({
            column: joi.string().min(1).max(128),
            direction: joi.string().valid(['ASC', 'DESC'])
        })),
        paging: joi.object({
            pageNumber: joi.number().min(1).required(),
            pageSize: joi.number().min(1).required()
        }),
        filterBy: joi.object({
            module: joi.string().min(1),
            actionId: joi.number().min(1),
            isActive: joi.boolean().allow(0, 1),
            reasonName: joi.string().max(255)
        })
    }),
    result: joi.any()
};
