'use strict';
var joi = require('joi');

module.exports = {
    description: 'get reason',
    notes: ['get card action reason'],
    tags: ['get', 'card', 'action', 'reason'],
    params: joi.object({
        reasonId: joi.number().min(1).required()
    }),
    result: joi.any()
};
