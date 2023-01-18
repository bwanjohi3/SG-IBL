'use strict';
var joi = require('joi');

module.exports = {
    description: 'get bin by id',
    notes: ['get card bin'],
    tags: ['get', 'card', 'bin'],
    params: joi.object().keys({
        binId: joi.number().integer().required()
    }).required(),
    result: joi.object()
};
