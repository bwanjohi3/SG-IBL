var joi = require('joi');

module.exports = {
    description: 'Edit binList',
    tags: ['pos', 'binList', 'edit'],
    params: joi.any(),
    result: joi.any()
};
