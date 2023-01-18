'use strict';
var joi = require('joi');

module.exports = {
    description: 'fetch type details',
    notes: ['fetch type'],
    tags: ['card', 'type'],
    params: joi.object({
        typeId: joi.number().min(1).required()
    }),
    result: joi.any()
};
