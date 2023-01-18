var joi = require('joi');

module.exports = {
    description: 'fetch card products',
    notes: ['fetch card products'],
    tags: ['card', 'products', 'fetch'],
    params: joi.object({
        filterBy: joi.object({
            isActive: joi.boolean().allow(0, 1, '0', '1'),
            productName: joi.string().max(70),
            businessUnitId: joi.number()
        }),
        orderBy: joi.object({
            column: joi.string(),
            direction: joi.string().valid('asc', 'desc', 'ASC', 'DESC')
        }),
        paging: joi.object({
            pageSize: joi.number(),
            pageNumber: joi.number(),
            recordsTotal: joi.number(),
            pagesTotal: joi.number()
        })
    }),
    result: joi.any()
};
