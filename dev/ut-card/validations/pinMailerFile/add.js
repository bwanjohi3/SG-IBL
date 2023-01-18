var joi = require('joi');

module.exports = {
    description: 'pin mailer add',
    notes: ['pin mailer add'],
    tags: ['pin', 'mailer', 'file'],
    params: joi.any(),
    result: joi.any()
};
