'use strict';
var joi = require('joi');

module.exports = {
    description: 'search card by card number',
    notes: ['search card by card number'],
    tags: ['search', 'card'],
    params: joi.object({
        cardNumber: joi.string().max(20).required().error(new Error('Invalid card number'))
    }),
    result: joi.any()
};
