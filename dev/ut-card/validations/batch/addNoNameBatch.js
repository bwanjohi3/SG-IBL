'use strict';
var joi = require('joi');

module.exports = {
    description: 'add no name batch',
    notes: ['add no name batch'],
    tags: ['batch', 'add', 'no name'],
    params: joi.object({
        batch: joi.object({
            batchName: joi.string().allow(null).optional(),
            numberOfCards: joi.number().required(),
            targetBranchId: joi.number().required(),
            issuingBranchId: joi.number().required(),
            typeId: joi.number().required()
        })
    }),
    result: joi.any()
};
