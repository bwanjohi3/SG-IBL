var joi = require('joi');

module.exports = {
    description: 'list document types',
    notes: ['list document types'],
    tags: ['card', 'documentsType', 'list'],
    payload: joi.any(),
    result: joi.any()
};
