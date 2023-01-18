var joi = require('joi');

module.exports = {
    description: 'fetch pin mailer file',
    notes: ['fetch pin mailer'],
    tags: ['pin', 'mailer', 'fetch'],
    params: joi.any(),
    result: joi.any()
};

