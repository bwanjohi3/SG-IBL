'use strict';
var joi = require('joi');

module.exports = {
    description: 'fetch ownership types. own or external',
    notes: ['fetch ownership types'],
    tags: ['card', 'ownershipType', 'fetch'],
    params: joi.object(),
    result: joi.any()
};
