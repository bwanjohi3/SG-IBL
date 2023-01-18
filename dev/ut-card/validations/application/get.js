'use strict';
var joi = require('joi');

module.exports = {
    description: 'fetch card application details',
    notes: ['fetch card application details'],
    tags: ['card', 'application', 'details', 'fetch'],
    params: joi.object().keys({
        applicationId: joi.number().integer().min(1).required()
    }),
    // TODO: handle return error
    result: joi.object().keys({
        accounts: joi.array().required(),
        accountLink: joi.array().items(joi.object().keys({
            accountLinkId: joi.number().required(),
            code: joi.string().required(),
            name: joi.string().required()
        })).required(),
        documents: joi.array().allow([]).required(),
        application: joi.array().items(joi.object().required()).required()
    })
};
