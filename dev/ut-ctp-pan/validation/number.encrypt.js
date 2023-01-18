'use strict';
const joi = require('joi');
const create = require('ut-error').define;
const Card = create('card');
const invalidNumber = create('invalidNumber', Card, 'Invalid card number');

module.exports = {
    description: 'encrypt card number',
    notes: ['encrypt card number'],
    tags: ['pan', 'number', 'encrypt'],
    params: joi.object({
        card: joi.string().regex(/[\d]{12,19}/i).required().description('card number to be encrypted').error(invalidNumber()),
        cipher: joi.string().allow(null, '').optional()
    }),
    response: joi.any(),
    auth: false
};
