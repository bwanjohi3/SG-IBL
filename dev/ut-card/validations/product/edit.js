var joi = require('joi');

module.exports = {
    description: 'edit card product',
    notes: ['edit card product'],
    tags: ['card', 'product', 'edit'],
    params: joi.object({
        product: joi.object({
            productId: joi.number(),
            startDate: joi.string().required(),
            endDate: joi.string().allow(null).required(),
            isActive: joi.boolean().allow(0, 1, '0', '1')
        }),
        productAccountType: joi.array().items(
            joi.object().keys({
                accountTypeId: joi.number().required(),
                productId: joi.number().required()
            })
        ).sparse().min(1).required(),
        noResultSet: joi.boolean()
    }),
    result: joi.any()
};
