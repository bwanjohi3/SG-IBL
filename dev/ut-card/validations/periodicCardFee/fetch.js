var joi = require('joi');

module.exports = {
    description: 'Fetch periodic card fee',
    payload: joi.any(),
    result: joi.object()
};
