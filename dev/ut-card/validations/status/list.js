var joi = require('joi');

module.exports = {
    description: 'list statuses',
    notes: ['list statuses'],
    tags: ['card', 'status', 'list'],
    payload: joi.any(),
    result: joi.any()
};
