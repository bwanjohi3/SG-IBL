'use strict';
var joi = require('joi');

module.exports = {
    description: 'fetch batch pans',
    notes: ['fetch batch pans'],
    tags: ['card', 'batch', 'get', 'pan'],
    params: joi.object({
        batchId: joi.number().min(1).required()
    }),
    result: joi.any()
};
