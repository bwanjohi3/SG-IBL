'use strict';
var joi = require('joi');

module.exports = {
    description: 'list card emv tags',
    payload: joi.any(),
    result: joi.any()
};
