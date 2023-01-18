'use strict';
var joi = require('joi');

module.exports = {
    description: 'fetch card config',
    notes: ['fetch card config'],
    tags: ['card', 'config', 'fetch'],
    payload: joi.object(),
    result: joi.any()
};
