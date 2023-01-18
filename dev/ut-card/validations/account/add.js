var joi = require('joi');

module.exports = {
    description: 'card account add',
    notes: ['card account add'],
    tags: ['card', 'account', 'add'],
    params: joi.object({
        cardId: joi.number().min(1).required(),
        accountId: joi.number().min(1).required()
    }),
    result: joi.any()
};
