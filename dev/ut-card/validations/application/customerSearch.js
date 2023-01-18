'use strict';
var joi = require('joi');

module.exports = {
    description: 'search customers by customer name',
    notes: ['search customers by customer name'],
    tags: ['search', 'customers'],
    params: joi.object().keys({
        customerName: joi.string().max(500).required(),
        productId: joi.number().integer().required()
    }),
    result: joi.object().keys({
        customer: joi.array().items(joi.object({
            customerName: joi.string().required(),
            customerNumber: joi.string().required(),
            personName: joi.string().required(),
            personNumber: joi.string().required(),
            telMobile: joi.string().allow(null).required()
        })).required()
    }).required()
};
