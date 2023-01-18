var joi = require('joi');

module.exports = {
    description: 'Fetch atm terminals',
    tags: ['atm', 'terminal', 'fetch'],
    params: joi.object({
        atmId: joi.number().min(1).description('Atm ID'),
        pageSize: joi.number().integer().min(1),
        pageNumber: joi.number().integer().min(1)
    }),
    result: joi.object()
};
