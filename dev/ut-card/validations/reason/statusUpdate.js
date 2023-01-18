'use strict';
var joi = require('joi');

module.exports = {
    description: 'add reasons',
    notes: ['add card action reasons'],
    tags: ['add', 'card', 'action', 'reason'],
    params: joi.object({
        reason: joi.array().min(1).items(
            joi.object({
                reasonId: joi.number().min(1).required(),
                isActive: joi.boolean().allow(0, 1).required()
            })
        ).required()
    }),
    result: joi.any()
};
