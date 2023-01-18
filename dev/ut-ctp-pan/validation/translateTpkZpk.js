'use strict';
var joi = require('joi');

module.exports = {
    description: 'translate pinblock',
    notes: ['translate pinblock'],
    tags: ['tpk', 'zpk'],
    params: joi.any(),
    response: joi.any(),
    auth: false
};
