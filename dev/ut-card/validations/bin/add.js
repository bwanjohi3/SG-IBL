'use strict';
var joi = require('joi');

module.exports = {
    description: 'add bin',
    notes: ['add card bin'],
    tags: ['add', 'card', 'bin'],
    params: joi.object().keys({
        bin: joi.object().keys({
            ownershipTypeId: joi.number().required(),
            startBin: joi.number().min(100000).max(99999999).required(),
            endBin: joi.number().min(joi.ref('startBin')).max(99999999),
            description: joi.string().required()
        }).required()
    }).required(),
    result: joi.object()
};
