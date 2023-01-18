var joi = require('joi');

module.exports = {
    description: 'card account setDefault',
    notes: ['card account setDefault'],
    tags: ['card', 'account', 'setDefault'],
    params: joi.object({
        cardId: joi.number().min(1).required(),
        accountId: joi.number().min(1).required()
    }),
    result: joi.any()
};
