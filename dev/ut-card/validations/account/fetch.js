var joi = require('joi');

module.exports = {
    description: 'fetch card account',
    notes: ['fetch card account'],
    tags: ['card', 'account', 'fetch'],
    params: joi.object({
        type: joi.any().allow(['distributed', 'application', 'card']).required(),
        cardId: joi.number().min(1).required()
    }),
    result: joi.any()
};
