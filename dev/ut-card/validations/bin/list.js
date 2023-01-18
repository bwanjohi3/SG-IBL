var joi = require('joi');

module.exports = {
    description: 'list card bins',
    notes: ['list card bins'],
    tags: ['card', 'bins', 'list'],
    params: joi.object({
        isActive: joi.number().min(0).max(1),
        skipUsed: joi.boolean().allow(0, 1, '0', '1')
    }),
    result: joi.any()
};
