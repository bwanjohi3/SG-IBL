var joi = require('joi');

module.exports = {
    description: 'Terminal Application Fetch',
    tags: ['pos', 'app', 'fetch'],
    params: joi.any(),
    result: joi.any()
};
