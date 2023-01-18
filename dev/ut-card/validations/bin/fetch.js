var joi = require('joi');

module.exports = {
    description: 'fetch card bins',
    notes: ['fetch card bins'],
    tags: ['card', 'bin', 'fetch'],
    params: joi.object().keys({
        orderBy: joi.array().items(joi.object({
            column: joi.string(),
            direction: joi.string().valid(['ASC', 'DESC'])
        })),
        filterBy: joi.object().keys({
            isActive: joi.boolean().allow(0, 1, null)
        }),
        paging: joi.object().keys({
            pageNumber: joi.number(),
            pageSize: joi.number().min(1)
        })
    }),
    result: joi.object()
};
