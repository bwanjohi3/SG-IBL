var joi = require('joi');

module.exports = {
    description: 'Edit Terminal',
    tags: ['pos', 'terminal', 'edit'],
    params: joi.any(),
    result: joi.any()
};
