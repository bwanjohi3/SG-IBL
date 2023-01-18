'use strict';
var joi = require('joi');

module.exports = {
    description: 'fetch batch embosserFile',
    notes: ['fetch batch embosserFile'],
    tags: ['card', 'batch', 'embosserFile'],
    params: joi.any(),
    result: joi.any()
};
