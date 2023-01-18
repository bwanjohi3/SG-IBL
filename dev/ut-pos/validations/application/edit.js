var joi = require('joi');

module.exports = {
    description: 'Edit Application',
    tags: ['pos', 'app', 'edit'],
    params: joi.any(),
    result: joi.any()
};
