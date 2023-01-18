'use strict';
var joi = require('joi');

module.exports = {
    description: 'edit card bin',
    notes: ['edit card bin'],
    tags: ['edit', 'card', 'bin'],
    params: joi.object().keys({
        bin: joi.alternatives().try(
            joi.array().items(joi.object().keys({
                binId: joi.number().min(1).required(),
                ownershipTypeLabel: joi.string().valid(['own', 'external']).required(),
                ownershipTypeId: joi.number().required(),
                startBin: joi.number().min(100000).max(99999999).required(),
                endBin: joi.when('ownershipTypeLabel', {is: 'external', then: joi.number().min(joi.ref('startBin')).max(99999999), otherwise: joi.number().valid(joi.ref('startBin'))}),
                description: joi.string().min(1).required()

                // binId: joi.number().integer().required(),
                // startBin: joi.string().min(6).max(6).required(),
                // endBin: joi.string().min(6).max(6).required(),
                // description: joi.string().required(),
                // ownershipTypeId: joi.string().required(),
                // isActive: joi.boolean().required()
            })).required(),
            joi.object().keys({
                binId: joi.number().min(1).required(),
                ownershipTypeLabel: joi.string().valid(['own', 'external']).required(),
                ownershipTypeId: joi.number().required(),
                startBin: joi.number().min(100000).required(),
                endBin: joi.when('ownershipTypeLabel', {is: 'external', then: joi.number().min(joi.ref('startBin')), otherwise: joi.number().valid(joi.ref('startBin'))}),
                description: joi.string().min(1).required()

                // binId: joi.number().integer().required(),
                // startBin: joi.string().min(6).max(6).required(),
                // endBin: joi.string().min(6).max(6).required(),
                // description: joi.string().required(),
                // ownershipTypeId: joi.string().required(),
                // isActive: joi.boolean().required()
            }).required()
        )
    }).required(),
    result: joi.alternatives().try(joi.object(), joi.array())
};
