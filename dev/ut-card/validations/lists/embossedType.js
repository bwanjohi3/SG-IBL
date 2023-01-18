'use strict';
var joi = require('joi');

module.exports = {
    description: 'fetch embossed types. Name or No name',
    notes: ['fetch embossed types'],
    tags: ['card', 'embossedType', 'fetch'],
    params: joi.object(),
    result: joi.any()
};
