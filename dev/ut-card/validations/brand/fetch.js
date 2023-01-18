'use strict';
var joi = require('joi');

module.exports = {
    description: 'fetch card type',
    notes: ['fetch card type'],
    tags: ['card', 'type', 'fetch'],
    payload: joi.any(),
    result: joi.any()
};
