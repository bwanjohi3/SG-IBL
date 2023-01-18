var joi = require('joi');

module.exports = {
    description: 'Terminal brand and model list',
    tags: ['pos', 'terminal', 'brand', 'model'],
    params: joi.any(),
    result: joi.any()
};
