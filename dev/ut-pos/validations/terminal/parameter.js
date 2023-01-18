var joi = require('joi');

module.exports = {
    description: 'Terminal parameter list',
    tags: ['pos', 'terminal', 'parameter'],
    params: joi.object({}),
    result: joi.any()
};
