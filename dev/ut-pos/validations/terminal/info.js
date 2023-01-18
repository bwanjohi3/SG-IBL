var joi = require('joi');

module.exports = {
    description: 'Terminal Info',
    tags: ['pos', 'terminal', 'info'],
    params: joi.any(),
    result: joi.any()
};
