var joi = require('joi');

module.exports = {
    description: 'Terminal Application List',
    tags: ['pos', 'terminal', 'app'],
    params: joi.any(),
    result: joi.any()
};
