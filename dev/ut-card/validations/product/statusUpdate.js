var joi = require('joi');

module.exports = {
    description: 'status card product update',
    notes: ['status card product update'],
    tags: ['card', 'product', 'statusUpdate'],
    params: joi.object({
        product: joi.array().items(
            joi.object({
                productId: joi.number(),
                isActive: joi.boolean().allow(0, 1, '0', '1')
            })
        )
    }),
    result: joi.any()
};
