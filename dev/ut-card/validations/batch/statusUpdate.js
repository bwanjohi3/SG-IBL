'use strict';
var joi = require('joi');

module.exports = {
    description: 'update batch status',
    notes: ['update batch status'],
    tags: ['batch', 'update', 'status'],
    params: joi.object({
        batchActionId: joi.number().required(),
        batchActionLabel: joi.string().required(),
        // TODO: Joi.object().keys([schema])
        batch: joi.object({
            // required
            batchId: joi.number().min(1).required(),
            batchName: joi.string().min(1).max(100).required(),
            statusId: joi.number().min(1).required(),
            branchId: joi.number().min(1).required(),
            targetBranchId: joi.number().min(1).required(),
            namedBatch: joi.boolean().required(),
            // conditional
            issuingBranchId: joi.when('namedBatch', {is: false, then: joi.number().min(1).required(), otherwise: joi.number().valid(null).optional()}),
            typeId: joi.when('namedBatch', {is: false, then: joi.number().min(1).required(), otherwise: joi.number().valid(null).optional()}),
            numberOfCards: joi.when('namedBatch', {is: false, then: joi.number().required(), otherwise: joi.number().valid(null).optional()}),
            // optional
            reasonId: joi.number().min(1).optional(),
            comments: joi.string().min(0).max(1000).optional()
        }).required(),
        cardsCurrentBranchId: joi.number().min(1).allow(null).optional()
    }),
    result: joi.any()
};
