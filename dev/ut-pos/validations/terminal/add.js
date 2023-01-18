var joi = require('joi');

module.exports = {
    description: 'Add new Terminal',
    tags: ['pos', 'terminal', 'add'],
    params: joi.any(),
    result: joi.any()
};
