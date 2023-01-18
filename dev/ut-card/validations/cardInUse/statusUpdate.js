'use strict';
var joi = require('joi');

module.exports = {
    description: 'card in use status update',
    notes: ['update cards in usestatus'],
    tags: ['card', 'inUse'],
    params: joi.object({
        cardActionId: joi.number().min(1).required(),
        cardActionLabel: joi.string().optional(),
        card: joi.array().items(joi.object().keys({
            cardId: joi.number().min(1).required(),
            statusId: joi.number().min(1).required(),
            personNumber: joi.string().allow(['', null]),
            customerNumber: joi.string(),
            reasonId: joi.number().min(1),
            comments: joi.string().allow('')
        })).required(),
        account: joi.array().items(joi.object().keys({
            cardId: joi.number().min(1).required(),
            accountNumber: joi.string().required(),
            accountOrder: joi.number().min(1).required(),
            accountTypeName: joi.string().required(),
            cardAccountId: joi.number().min(1),
            currency: joi.string().required(),
            isLinked: joi.boolean().allow(0, 1, '0', '1').required(),
            isPrimary: joi.boolean().allow(0, 1, '0', '1').required(),
            accountLinkId: joi.number().integer().allow(null).optional()
        })),
        attachment: joi.array().items(joi.object().keys({
            attachmentId: joi.number().min(1).required(),
            contentType: joi.string().required(),
            documentId: joi.string().max(20).required(),
            documentTypeId: joi.string().max(200).required(),
            extension: joi.string().max(50).required(),
            filename: joi.string().required(),
            hash: joi.string().required(),
            page: joi.number()
        })),
        newAttachments: joi.array().items(joi.object().keys({
            documentId: joi.string().required(),
            documentTypeId: joi.string().optional(),
            filename: joi.string().required(),
            page: joi.number().integer().required()
        })),
        document: joi.array().items(joi.object().keys({
            documentId: joi.string().max(100).required(),
            documentTypeId: joi.string().required()
        }))
    }),
    result: joi.any()
};
