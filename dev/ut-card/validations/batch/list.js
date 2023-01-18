'use strict';
var joi = require('joi');

module.exports = {
    description: 'list batches in which applications can be added',
    notes: ['list batches'],
    tags: ['card', 'batch', 'list'],
    params: joi.object({
        embossedTypeId: joi.number().min(0).required()
    }),
    result: joi.any()
};
