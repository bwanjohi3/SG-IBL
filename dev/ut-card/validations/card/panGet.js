'use strict';
var joi = require('joi');

module.exports = {
    description: 'fetch card pan',
    notes: ['fetch card pan'],
    tags: ['card', 'get', 'pan'],
    params: joi.object({
        cardId: joi.number().min(1).required()
    }),
    result: joi.any()
};
