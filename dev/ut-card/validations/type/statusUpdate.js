var joi = require('joi');

module.exports = {
    description: 'status card type update',
    notes: ['status card type update'],
    tags: ['card', 'type', 'statusUpdate'],
    params: joi.object({
        type: joi.array().items(
            joi.object({
                typeId: joi.number(),
                isActive: joi.boolean().allow(0, 1, '0', '1')
            })
        )
    }),
    result: joi.any()
};
