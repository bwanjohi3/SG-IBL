'use strict';
var joi = require('joi');

module.exports = {
    description: 'generate Cvv* list',
    notes: ['generate Cvv* list'],
    tags: ['pan', 'generate', 'cvv', 'list'],
    params: joi.array().items(
        joi.object({
            cardId: joi.number().integer().required().description('record id'),
            pan: joi.string().regex(/[0-9a-f]/ig).length(32).required().description('crypted card number'),
            cvk: joi.string().regex(/[0-9a-f]/ig).required().description('card verification key'),
            cvv1: joi.boolean().allow(null).required().description('cvv 1'),
            cvv2: joi.boolean().allow(null).required().description('cvv 2'),
            icvv: joi.boolean().allow(null).required().description('icvv'),
            serviceCode: joi.number().integer().required().description('service code'),
            expirationDate: joi.date().required().description('card expiration date'),
            cipher: joi.string().required().description('encryption algorithm'),
            pvk: joi.string().allow(null).required().description('pvk'),
            decimalisation: joi.string().allow(null).required().description('decimalisation')
        })
    ),
    response: joi.any(),
    auth: false
};
