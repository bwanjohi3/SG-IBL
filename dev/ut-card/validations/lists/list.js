var joi = require('joi');

module.exports = {
    description: 'List Accounts',
    payload: joi.any(),
    result: joi.array()
};
