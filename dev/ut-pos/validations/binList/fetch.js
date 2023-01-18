var joi = require('joi');

module.exports = {
    description: 'Terminal binList Fetch',
    tags: ['pos', 'binList', 'fetch'],
    params: joi.any(),
    result: joi.any()
};
