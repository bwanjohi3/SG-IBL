'use strict';
var joi = require('joi');

module.exports = {
    description: 'delete reasons',
    notes: ['delete card action reasons'],
    tags: ['delete', 'card', 'action', 'reason'],
    params: joi.object({
        reason: joi.array().min(1).items(joi.number().min(1)).required()
    }),
    result: joi.any()
};
