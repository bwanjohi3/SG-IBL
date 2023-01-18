var joi = require('joi');

module.exports = {
    description: 'fetch message alerts',
    notes: ['fetch message alerts'],
    tags: ['card', 'queueOut', 'fetch'],
    params: joi.any(),
    result: joi.any()
};
