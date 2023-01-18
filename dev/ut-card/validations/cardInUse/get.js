'use strict';
var joi = require('joi');

module.exports = {
    description: 'get card in use',
    notes: ['get card'],
    tags: ['card', 'cards', 'get'],
    params: joi.object({
        cardId: joi.number().min(1).required()
    }),
    result: joi.any()
};
