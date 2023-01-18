var joi = require('joi');

module.exports = {
    description: 'Terminal organization list',
    tags: ['pos', 'terminal', 'organization'],
    params: joi.object({}),
    result: joi.any()
};
