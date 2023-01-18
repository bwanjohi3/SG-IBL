'use strict';
var joi = require('joi');

module.exports = {
    description: 'add reasons',
    notes: ['add card action reasons'],
    tags: ['add', 'card', 'action', 'reason'],
    params: joi.object({
        reason: joi.object({
            reasonId: joi.number().min(1).required(),
            module: joi.string().valid(['Application', 'Batch', 'Card', 'CardInUse']).required(),
            name: joi.string().max(170).required(),
            isActive: joi.boolean().allow(0, 1).required()
        }).required(),
        action: joi.array().min(1).items(joi.number().min(1)).required()
    }),
    result: joi.any()
};
