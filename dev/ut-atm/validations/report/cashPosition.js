var joi = require('joi');

module.exports = {
    description: 'atm cash position report',
    tags: ['atm', 'report', 'cash', 'position'],
    params: joi.object().keys({
        transferCurrency: joi.string().length(3).error(new Error('Invalid transfer currency')),
        terminalId: joi.string().max(8).regex(/[\d]/).error(new Error('Invalid terminal id')),
        terminalName: joi.string().max(40).error(new Error('Invalid terminal name')),
        pageSize: joi.number(),
        pageNumber: joi.number()
    }),
    result: joi.object().keys({
        cashPosition: joi.any(),
        pagination: joi.array().items(joi.object().keys({
            pageSize: joi.number(),
            pageNumber: joi.number(),
            pagesTotal: joi.number(),
            recordsTotal: joi.number()
        }))
    })
};
