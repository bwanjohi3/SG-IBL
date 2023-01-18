'use strict';
var joi = require('joi');

module.exports = {
    description: 'list actions',
    notes: ['list actions'],
    tags: ['list', 'actions'],
    params: joi.object(),
    result: joi.any()
};
