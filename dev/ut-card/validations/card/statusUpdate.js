'use strict';
var joi = require('joi');

module.exports = {
    description: 'card status update',
    notes: ['update cards status'],
    tags: ['card', 'cards'],
    params: joi.object({
        cardActionId: joi.number().min(1).required(),
        cardActionLabel: joi.string().optional(),
        card: joi.array().items(joi.object().keys({
            cardId: joi.number().min(1).required(),
            statusId: joi.number().min(1).required(),
            reasonId: joi.number().min(1),
            comments: joi.string().allow(''),
            pinOffset: joi.string().allow(null).optional(),
            targetBranchId: joi.number().min(1)
        })).required()
    }),
    result: joi.any()
};
