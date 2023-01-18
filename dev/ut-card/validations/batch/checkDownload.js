'use strict';
var joi = require('joi');

module.exports = {
    description: 'check batch download',
    notes: ['check batch download'],
    tags: ['batch', 'check', 'download'],
    params: joi.object({
        batchId: joi.number().required(),
        checkedIdx: joi.number().optional()
    }),
    result: joi.any()
};
