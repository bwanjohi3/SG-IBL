'use strict';
var joi = require('joi');

module.exports = {
    description: 'Get Issue Types',
    notes: ['Get Issue Types'],
    tags: ['Get Issue Types'],
    params: joi.object().keys({
    }),
    result: joi.object().keys({
        allIssueTypes: joi.array().items(joi.object({
            issueTypeId: joi.string().required(),
            issuerName: joi.string().required()
        })).required()
    }).required()
};
