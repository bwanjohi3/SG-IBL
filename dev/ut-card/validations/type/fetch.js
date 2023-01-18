var joi = require('joi');

module.exports = {
    description: 'fetch card types',
    notes: ['fetch card types'],
    tags: ['card', 'types', 'fetch'],
    params: joi.object({
        filterBy: joi.object({
            isActive: joi.boolean().allow(0, 1, '0', '1'),
            typeName: joi.string().max(70),
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
