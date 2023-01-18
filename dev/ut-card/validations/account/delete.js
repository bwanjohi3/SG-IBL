var joi = require('joi');

module.exports = {
    description: 'card account delete',
    notes: ['card account delete'],
    tags: ['card', 'account', 'delete'],
    params: joi.object({
        cardId: joi.number().min(1).required(),
        accountId: joi.number().min(1).required()
    }),
    result: joi.any()
};
