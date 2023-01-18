'use strict';
var joi = require('joi');

module.exports = {
    description: 'generate card number',
    notes: ['generate card number'],
    tags: ['pan', 'number', 'generate'],
    params: joi.object({
        panLength: joi.number().integer().required().description('How long card number is'),
        count: joi.number().integer().required().description('How many numbers to be generated'),
        checkSum: joi.string().allow([true, false]).required().description('Name of algorithm to use for checksum digit'),
        start: joi.number().integer().required().description('Start value for the sequence'),
        prefix: joi.string().min(1).required().description('Card prefix'),
        cipher: joi.string().required().description('Encryption algorithm')
    }),
    response: joi.any(),
    auth: false
};
