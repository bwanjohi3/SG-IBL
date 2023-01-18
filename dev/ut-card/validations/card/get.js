'use strict';
var joi = require('joi');

module.exports = {
    description: 'fetch cards',
    notes: ['fetch cards'],
    tags: ['card', 'cards'],
    params: joi.object({
        cardId: joi.number().min(1).required()
    }),
    result: joi.any()
};
