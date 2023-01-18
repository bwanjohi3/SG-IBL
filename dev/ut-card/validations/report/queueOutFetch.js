'use strict';
var joi = require('joi');

module.exports = {
    description: 'get the list of messages',
    notes: ['Get list of messages'],
    tags: ['card', 'report', 'queueOutFetch'],
    params: joi.any(),
    result: joi.any()
};
