var joi = require('joi');

module.exports = {
    description: 'Fetch card number constructions',
    payload: joi.any(),
    result: joi.object()
};
