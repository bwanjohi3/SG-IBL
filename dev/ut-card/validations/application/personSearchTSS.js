'use strict';
var joi = require('joi');

module.exports = {
    description: 'search persons by customer number and person name',
    notes: ['search persons by customer number and person name'],
    tags: ['search', 'persons'],
    params: joi.object().keys({
        customerNumber: joi.string().max(50).required(),
        personName: joi.string().allow(null).max(100).optional()
    }),
    result: joi.object().keys({
        person: joi.array().items(joi.object().keys({
            customerName: joi.string().required(),
            customerNumber: joi.string().required(),
            personName: joi.string().required(),
            personNumber: joi.string().required(),
            telMobile: joi.string().allow(null).required()
        }))
    }).required()
};
