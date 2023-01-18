'use strict';
var joi = require('joi');

module.exports = {
    description: 'fetch product details',
    notes: ['fetch product'],
    tags: ['card', 'product'],
    params: joi.object({
        productId: joi.number().min(1).required()
    }),
    result: joi.any()
};
